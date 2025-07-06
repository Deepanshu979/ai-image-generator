const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoService {
  constructor() {
    this.outputDir = path.join(__dirname, '../uploads/videos');
    this.tempDir = path.join(__dirname, '../uploads/temp');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async createVideoFromImages(images, options = {}) {
    const {
      duration = 5,
      fps = 30,
      transition = 'fade',
      quality = 'medium',
      resolution = { width: 1920, height: 1080 },
      outputFormat = 'mp4'
    } = options;

    const videoId = uuidv4();
    const startTime = Date.now();

    try {
      // Prepare images for video
      const processedImages = await this.prepareImages(images, resolution);
      
      // Create video with transitions
      const videoPath = await this.generateVideo(processedImages, {
        duration,
        fps,
        transition,
        quality,
        resolution,
        outputFormat,
        videoId
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        videoId,
        videoPath,
        metadata: {
          imageCount: images.length,
          duration,
          fps,
          transition,
          quality,
          resolution,
          processingTime
        }
      };

    } catch (error) {
      console.error('Video generation error:', error);
      return {
        success: false,
        videoId,
        error: error.message,
        metadata: {
          imageCount: images.length,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  async prepareImages(images, resolution) {
    const processedImages = [];
    
    for (let i = 0; i < images.length; i++) {
      const imageBuffer = await this.downloadImage(images[i]);
      
      const processedBuffer = await sharp(imageBuffer)
        .resize(resolution.width, resolution.height, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      const tempPath = path.join(this.tempDir, `frame_${i}.jpg`);
      await fs.writeFile(tempPath, processedBuffer);
      processedImages.push(tempPath);
    }

    return processedImages;
  }

  async downloadImage(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async generateVideo(images, options) {
    const {
      duration,
      fps,
      transition,
      quality,
      resolution,
      outputFormat,
      videoId
    } = options;

    return new Promise((resolve, reject) => {
      const outputPath = path.join(this.outputDir, `${videoId}.${outputFormat}`);
      const frameDuration = duration / images.length;

      let command = ffmpeg();

      // Add input images
      images.forEach((imagePath, index) => {
        command = command.input(imagePath);
      });

      // Configure video settings
      command
        .inputOptions([
          '-framerate', fps.toString(),
          '-loop', '1'
        ])
        .outputOptions([
          '-c:v', 'libx264',
          '-preset', this.getPreset(quality),
          '-crf', this.getCRF(quality),
          '-pix_fmt', 'yuv420p',
          '-vf', this.getVideoFilter(images.length, frameDuration, transition, fps),
          '-r', fps.toString(),
          '-s', `${resolution.width}x${resolution.height}`
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent}% done`);
        })
        .on('end', () => {
          console.log('Video generation completed');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
  }

  getPreset(quality) {
    const presets = {
      low: 'ultrafast',
      medium: 'fast',
      high: 'medium'
    };
    return presets[quality] || 'fast';
  }

  getCRF(quality) {
    const crfValues = {
      low: 28,
      medium: 23,
      high: 18
    };
    return crfValues[quality] || 23;
  }

  getVideoFilter(imageCount, frameDuration, transition, fps) {
    const transitionDuration = 0.5; // seconds
    const frameCount = Math.floor(frameDuration * fps);
    const transitionFrames = Math.floor(transitionDuration * fps);

    let filter = '';

    switch (transition) {
      case 'fade':
        filter = this.createFadeTransition(imageCount, frameCount, transitionFrames);
        break;
      case 'slide':
        filter = this.createSlideTransition(imageCount, frameCount, transitionFrames);
        break;
      case 'zoom':
        filter = this.createZoomTransition(imageCount, frameCount, transitionFrames);
        break;
      default:
        filter = this.createSimpleTransition(imageCount, frameCount);
    }

    return filter;
  }

  createFadeTransition(imageCount, frameCount, transitionFrames) {
    let filter = '';
    
    for (let i = 0; i < imageCount; i++) {
      const startFrame = i * frameCount;
      const endFrame = (i + 1) * frameCount;
      
      if (i === 0) {
        filter += `[${i}:v]fade=t=in:st=0:d=${transitionFrames/30},`;
      } else if (i === imageCount - 1) {
        filter += `[${i}:v]fade=t=out:st=${(frameCount-transitionFrames)/30}:d=${transitionFrames/30},`;
      } else {
        filter += `[${i}:v]fade=t=in:st=0:d=${transitionFrames/30},fade=t=out:st=${(frameCount-transitionFrames)/30}:d=${transitionFrames/30},`;
      }
    }
    
    filter += `concat=n=${imageCount}:v=1:a=0[outv]`;
    return filter;
  }

  createSlideTransition(imageCount, frameCount, transitionFrames) {
    let filter = '';
    
    for (let i = 0; i < imageCount; i++) {
      const startFrame = i * frameCount;
      const endFrame = (i + 1) * frameCount;
      
      if (i === 0) {
        filter += `[${i}:v]slide=slide=left:duration=${transitionFrames/30},`;
      } else if (i === imageCount - 1) {
        filter += `[${i}:v]slide=slide=right:duration=${transitionFrames/30},`;
      } else {
        filter += `[${i}:v]slide=slide=left:duration=${transitionFrames/30},`;
      }
    }
    
    filter += `concat=n=${imageCount}:v=1:a=0[outv]`;
    return filter;
  }

  createZoomTransition(imageCount, frameCount, transitionFrames) {
    let filter = '';
    
    for (let i = 0; i < imageCount; i++) {
      const startFrame = i * frameCount;
      const endFrame = (i + 1) * frameCount;
      
      if (i === 0) {
        filter += `[${i}:v]zoompan=z='min(zoom+0.0015,1.5)':d=${frameCount}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,`;
      } else if (i === imageCount - 1) {
        filter += `[${i}:v]zoompan=z='max(1.5-0.0015*t,1)':d=${frameCount}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,`;
      } else {
        filter += `[${i}:v]zoompan=z='min(zoom+0.0015,1.5)':d=${frameCount}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080,`;
      }
    }
    
    filter += `concat=n=${imageCount}:v=1:a=0[outv]`;
    return filter;
  }

  createSimpleTransition(imageCount, frameCount) {
    let filter = '';
    
    for (let i = 0; i < imageCount; i++) {
      filter += `[${i}:v]`;
    }
    
    filter += `concat=n=${imageCount}:v=1:a=0[outv]`;
    return filter;
  }

  async addAudioToVideo(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('Audio added successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error adding audio:', err);
          reject(err);
        })
        .run();
    });
  }

  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  async cleanupTempFiles(files) {
    try {
      for (const file of files) {
        await fs.unlink(file);
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

module.exports = new VideoService(); 