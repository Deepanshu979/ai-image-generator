# AI Image & Video Generator

A MERN stack application that allows users to generate images from text prompts, upload images, combine them, and create videos using various AI models.

## Features

- **Text-to-Image Generation**: Generate images from text prompts using multiple AI models
- **Image Upload**: Upload and process custom images
- **Image Combination**: Combine multiple images into creative compositions
- **Video Generation**: Create videos from image sequences
- **Multiple AI Models**: Choose from different LLM models (OpenAI, Replicate, etc.)
- **User Authentication**: Secure user registration and login
- **Project Management**: Save and organize your creations
- **Real-time Processing**: Live status updates for generation tasks

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image storage
- **FFmpeg** for video processing
- **OpenAI API** and **Replicate** for AI models

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation
- **React Query** for state management
- **Framer Motion** for animations

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- FFmpeg (for video processing)
- API keys for:
  - OpenAI
  - Replicate
  - Cloudinary

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-image-video-generator
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Image Generation
- `POST /api/images/generate` - Generate image from prompt
- `POST /api/images/upload` - Upload image
- `GET /api/images/user/:userId` - Get user's images

### Video Generation
- `POST /api/videos/create` - Create video from images
- `GET /api/videos/user/:userId` - Get user's videos

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects/user/:userId` - Get user's projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Usage

1. **Register/Login**: Create an account or sign in
2. **Generate Images**: Use text prompts to generate images with your chosen AI model
3. **Upload Images**: Upload your own images for processing
4. **Combine Images**: Select multiple images to combine them
5. **Create Videos**: Generate videos from image sequences
6. **Save Projects**: Organize your creations into projects

## AI Models Supported

- **OpenAI DALL-E 3**: High-quality image generation
- **Stable Diffusion**: Open-source image generation
- **Midjourney** (via Replicate): Artistic image generation
- **Custom Models**: Add your own AI models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 