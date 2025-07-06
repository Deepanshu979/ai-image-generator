const OpenAI = require('openai');
const Replicate = require('replicate');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

class AIService {
  constructor() {
    this.models = {
      'openai-dall-e-3': {
        name: 'OpenAI DALL-E 3',
        provider: 'openai',
        maxTokens: 4000,
        supportedSizes: ['1024x1024', '1792x1024', '1024x1792'],
        costPerImage: 0.04
      },
      'stable-diffusion': {
        name: 'Stable Diffusion',
        provider: 'replicate',
        model: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        costPerImage: 0.01
      },
      'midjourney': {
        name: 'Midjourney',
        provider: 'replicate',
        model: 'midjourney/diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        costPerImage: 0.02
      }
    };
  }

  async generateImage(prompt, options = {}) {
    const {
      model = 'openai-dall-e-3',
      width = 1024,
      height = 1024,
      quality = 'standard',
      style = 'vivid',
      numImages = 1
    } = options;

    const modelConfig = this.models[model];
    if (!modelConfig) {
      throw new Error(`Unsupported model: ${model}`);
    }

    const generationId = uuidv4();
    const startTime = Date.now();

    try {
      let result;
      
      switch (modelConfig.provider) {
        case 'openai':
          result = await this.generateWithOpenAI(prompt, {
            width,
            height,
            quality,
            style,
            numImages
          });
          break;
        
        case 'replicate':
          result = await this.generateWithReplicate(prompt, {
            model: modelConfig.model,
            width,
            height,
            numImages
          });
          break;
        
        default:
          throw new Error(`Unsupported provider: ${modelConfig.provider}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        generationId,
        images: result.images,
        metadata: {
          model,
          prompt,
          settings: { width, height, quality, style },
          processingTime,
          tokensUsed: result.tokensUsed || 0,
          cost: result.cost || modelConfig.costPerImage
        }
      };

    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        generationId,
        error: error.message,
        metadata: {
          model,
          prompt,
          settings: { width, height, quality, style },
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  async generateWithOpenAI(prompt, options) {
    const { width, height, quality, style, numImages } = options;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: numImages,
      size: `${width}x${height}`,
      quality: quality,
      style: style,
    });

    return {
      images: response.data.map(img => ({
        url: img.url,
        revisedPrompt: img.revised_prompt
      })),
      tokensUsed: 0, // DALL-E doesn't use tokens in the same way
      cost: 0.04 * numImages
    };
  }

  async generateWithReplicate(prompt, options) {
    const { model, width, height, numImages } = options;

    const output = await replicate.run(model, {
      input: {
        prompt: prompt,
        width: width,
        height: height,
        num_outputs: numImages,
        num_inference_steps: 50,
        guidance_scale: 7.5
      }
    });

    return {
      images: Array.isArray(output) ? output.map(url => ({ url })) : [{ url: output }],
      tokensUsed: 0,
      cost: 0.01 * numImages
    };
  }

  async combineImages(images, options = {}) {
    const {
      layout = 'grid',
      width = 1024,
      height = 1024,
      spacing = 10,
      background = '#ffffff'
    } = options;

    try {
      let combinedImage;

      switch (layout) {
        case 'grid':
          combinedImage = await this.createGridLayout(images, { width, height, spacing, background });
          break;
        case 'horizontal':
          combinedImage = await this.createHorizontalLayout(images, { width, height, spacing, background });
          break;
        case 'vertical':
          combinedImage = await this.createVerticalLayout(images, { width, height, spacing, background });
          break;
        default:
          throw new Error(`Unsupported layout: ${layout}`);
      }

      return {
        success: true,
        imageUrl: combinedImage,
        metadata: {
          layout,
          imageCount: images.length,
          dimensions: { width, height }
        }
      };

    } catch (error) {
      console.error('Image combination error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createGridLayout(images, options) {
    const { width, height, spacing, background } = options;
    const cols = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / cols);
    
    const cellWidth = (width - (cols - 1) * spacing) / cols;
    const cellHeight = (height - (rows - 1) * spacing) / rows;

    const composite = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    const composites = [];
    
    for (let i = 0; i < images.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = col * (cellWidth + spacing);
      const y = row * (cellHeight + spacing);

      const resizedImage = await sharp(images[i])
        .resize(cellWidth, cellHeight, { fit: 'cover' })
        .toBuffer();

      composites.push({
        input: resizedImage,
        top: y,
        left: x
      });
    }

    const result = await composite.composite(composites).png().toBuffer();
    return `data:image/png;base64,${result.toString('base64')}`;
  }

  async createHorizontalLayout(images, options) {
    const { width, height, spacing } = options;
    const imageWidth = (width - (images.length - 1) * spacing) / images.length;

    const composite = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    const composites = [];
    
    for (let i = 0; i < images.length; i++) {
      const x = i * (imageWidth + spacing);
      
      const resizedImage = await sharp(images[i])
        .resize(imageWidth, height, { fit: 'cover' })
        .toBuffer();

      composites.push({
        input: resizedImage,
        top: 0,
        left: x
      });
    }

    const result = await composite.composite(composites).png().toBuffer();
    return `data:image/png;base64,${result.toString('base64')}`;
  }

  async createVerticalLayout(images, options) {
    const { width, height, spacing } = options;
    const imageHeight = (height - (images.length - 1) * spacing) / images.length;

    const composite = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    const composites = [];
    
    for (let i = 0; i < images.length; i++) {
      const y = i * (imageHeight + spacing);
      
      const resizedImage = await sharp(images[i])
        .resize(width, imageHeight, { fit: 'cover' })
        .toBuffer();

      composites.push({
        input: resizedImage,
        top: y,
        left: 0
      });
    }

    const result = await composite.composite(composites).png().toBuffer();
    return `data:image/png;base64,${result.toString('base64')}`;
  }

  getAvailableModels() {
    return Object.keys(this.models).map(key => ({
      id: key,
      ...this.models[key]
    }));
  }

  getModelInfo(modelId) {
    return this.models[modelId] || null;
  }
}

module.exports = new AIService(); 