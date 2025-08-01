const OpenAI = require('openai');
const Replicate = require('replicate');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const stream = require('stream');
const { promisify } = require('util');
const cloudinary = require('cloudinary').v2;

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
        costPerImage: 0.00001
      },
      'flux-dev': {
        name: 'Flux Dev',
        provider: 'replicate',
        model: 'black-forest-labs/flux-dev:552746e86aee3fe5fa9c6bf38a85a6a2932e27dd2b0dc392e00390fa14527027',
        costPerImage: 0.00001
      },
      'flux-schnell': {
        name: 'Flux Schnell',
        provider: 'replicate',
        model: 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e',
        costPerImage: 0.00001
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
        error: error.message || 'Unknown error occurred during image generation',
        metadata: {
          model,
          prompt,
          settings: { width, height, quality, style },
          processingTime: Date.now() - startTime,
          tokensUsed: 0,
          cost: 0
        }
      };
    }
  }

  async generateWithOpenAI(prompt, options) {
    const { width, height, numImages } = options;

    // DALL-E 3 only supports certain sizes and parameters
    const size = `${width}x${height}`;
    const allowedSizes = ["1024x1024", "1792x1024", "1024x1792"];
    const safeSize = allowedSizes.includes(size) ? size : "1024x1024";

    // Log the request to OpenAI for debugging
    console.log("OpenAI request:", {
      model: "dall-e-3",
      prompt,
      n: numImages,
      size: safeSize
    });

    // Only send supported parameters
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: numImages,
      size: safeSize
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
    
    console.log('generateWithReplicate called with model:', model);
    console.log('Full options:', options);

    // Handle Flux Dev model specifically
    if (model === 'black-forest-labs/flux-dev:552746e86aee3fe5fa9c6bf38a85a6a2932e27dd2b0dc392e00390fa14527027') {
      try {
        console.log('Starting Flux Dev generation with prompt:', prompt);
        console.log('Replicate auth token available:', !!process.env.REPLICATE_API_TOKEN);
        
        // Flux Dev with correct parameters
        const output = await replicate.run(model, {
          input: {
            prompt: prompt,
            guidance: 3.5
          }
        });

        console.log('Flux Dev output type:', typeof output);
        console.log('Flux Dev output:', output);

        // Handle different response formats
        let imageUrl;
        if (Array.isArray(output)) {
          console.log('Output is array, length:', output.length);
          imageUrl = output[0];
        } else if (output && typeof output === 'object' && output.url) {
          console.log('Output is object with url property');
          imageUrl = output.url;
        } else if (typeof output === 'string') {
          console.log('Output is direct string URL');
          imageUrl = output;
        } else {
          console.log('Unexpected output format:', output);
          throw new Error('Unexpected response format from Flux Dev');
        }

        // If imageUrl is a function, call it
        if (typeof imageUrl === 'function') {
          console.log('ImageUrl is a function, calling it');
          imageUrl = imageUrl();
        }

        console.log('Final imageUrl:', imageUrl);

        return {
          images: [{ url: imageUrl }],
          tokensUsed: 0,
          cost: 0.01 * numImages
        };
      } catch (error) {
        console.error('Flux Dev generation error:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`Flux Dev generation failed: ${error.message}`);
      }
    }

    // Handle Flux Schnell model specifically
    if (model === 'black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e') {
      try {
        console.log('Starting Flux Schnell generation with prompt:', prompt);
        console.log('Replicate auth token available:', !!process.env.REPLICATE_API_TOKEN);
        
        // Flux Schnell with correct parameters
        const output = await replicate.run(model, {
          input: {
            prompt: prompt
          }
        });

        console.log('Flux Schnell output type:', typeof output);
        console.log('Flux Schnell output:', output);

        // Handle different response formats
        let imageUrl;
        if (Array.isArray(output)) {
          console.log('Output is array, length:', output.length);
          imageUrl = output[0];
        } else if (output && typeof output === 'object' && output.url) {
          console.log('Output is object with url property');
          imageUrl = output.url;
        } else if (typeof output === 'string') {
          console.log('Output is direct string URL');
          imageUrl = output;
        } else {
          console.log('Unexpected output format:', output);
          throw new Error('Unexpected response format from Flux Schnell');
        }

        // If imageUrl is a function, call it
        if (typeof imageUrl === 'function') {
          console.log('ImageUrl is a function, calling it');
          imageUrl = imageUrl();
        }

        console.log('Final imageUrl:', imageUrl);

        return {
          images: [{ url: imageUrl }],
          tokensUsed: 0,
          cost: 0.01 * numImages
        };
      } catch (error) {
        console.error('Flux Schnell generation error:', error);
        console.error('Error stack:', error.stack);
        throw new Error(`Flux Schnell generation failed: ${error.message}`);
      }
    }

    // Handle other Replicate models
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

  /**
   * Downloads an image from a URL and uploads it to Cloudinary.
   * @param {string} imageUrl - The URL of the image to download.
   * @param {object} [options] - Cloudinary upload options.
   * @returns {Promise<string>} - The Cloudinary secure_url.
   */
  async uploadImageUrlToCloudinary(imageUrl, options = {}) {
    const finished = promisify(stream.finished);
    return new Promise((resolve, reject) => {
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to get image. Status code: ${response.statusCode}`));
        }
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        response.pipe(uploadStream);
        finished(uploadStream).catch(reject);
      }).on('error', reject);
    });
  }

  /**
   * Image-to-Image generation using Replicate prunaai/flux-kontext-dev
   * @param {Object} params
   * @param {Buffer} params.imageBuffer - The input image buffer
   * @param {string} params.prompt - The prompt for the model
   * @param {number} [params.guidance] - Guidance scale
   * @param {string} [params.speed_mode] - Speed mode
   * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
   */
  async imageToImage({ imageBuffer, prompt, guidance = 2.5, speed_mode = 'Real Time' }) {
    try {
      // 1. Upload the input image to Cloudinary (temporary, not saved in DB)
      const tempUrl = await cloudinary.uploader.upload_stream_promise
        ? await cloudinary.uploader.upload_stream_promise({
            folder: 'ai-generator/temp',
            resource_type: 'image',
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          }, imageBuffer)
        : await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'ai-generator/temp',
                resource_type: 'image',
                transformation: [
                  { quality: 'auto' },
                  { fetch_format: 'auto' }
                ]
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.Readable.from(imageBuffer).pipe(uploadStream);
          });
      const img_cond_path = tempUrl.secure_url;

      // 2. Call Replicate with the prunaai/flux-kontext-dev model
      const output = await replicate.run(
        "prunaai/flux-kontext-dev:2f311ad6069d6cb2ec28d46bb0d1da5148a983b56f4f2643d2d775d39d11e44b",
        {
          input: {
            prompt,
            guidance,
            speed_mode,
            img_cond_path
          }
        }
      );

      // output is usually an array of URLs, take the first
      const imageUrl = Array.isArray(output) ? output[0] : output;
      return { success: true, imageUrl };
    } catch (error) {
      console.error('Image-to-Image Replicate error:', error);
      return { success: false, error: error.message };
    }
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