# Environment Variables Setup Guide

Create a `.env` file in the root directory of your project with the following variables:

## Required Environment Variables

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/ai-image-generator
```
- For local MongoDB: `mongodb://localhost:27017/ai-image-generator`
- For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/ai-image-generator?retryWrites=true&w=majority`

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```
- Generate a strong random string (at least 32 characters)
- You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Server Configuration
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### OpenAI Configuration (for DALL-E 3)
```env
OPENAI_API_KEY=sk-your-openai-api-key
```
- Get your API key from: https://platform.openai.com/api-keys
- Cost: ~$0.04 per image

### Replicate Configuration (for Stable Diffusion, Midjourney)
```env
REPLICATE_API_TOKEN=r8_your-replicate-api-token-here
```
- Get your API token from: https://replicate.com/account/api-tokens
- Cost: ~$0.01-0.02 per image

### Cloudinary Configuration (for image/video storage)
```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```
- Get these from: https://cloudinary.com/console
- Free tier: 25GB storage, 25GB bandwidth/month

## Complete .env File Example

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-image-generator

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OpenAI Configuration (for DALL-E 3)
OPENAI_API_KEY=sk-your-openai-api-key

# Replicate Configuration (for Stable Diffusion, Midjourney)
REPLICATE_API_TOKEN=r8_your-replicate-api-token-here

# Cloudinary Configuration (for image/video storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## How to Get API Keys

### 1. OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Replicate API Token
1. Go to https://replicate.com/
2. Sign up or log in
3. Go to Account → API Tokens
4. Create a new token
5. Copy the token (starts with `r8_`)

### 3. Cloudinary Credentials
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Go to Dashboard
4. Copy your Cloud Name, API Key, and API Secret

### 4. MongoDB
#### Local MongoDB:
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/ai-image-generator`

#### MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster>` with your values

## Security Notes

1. **Never commit your `.env` file to version control**
2. **Use strong, unique JWT secrets**
3. **Keep your API keys secure**
4. **Use environment-specific configurations**

## Testing Your Setup

After setting up your `.env` file:

1. Install dependencies: `npm run install-all`
2. Start the server: `npm run server`
3. Test the health endpoint: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "AI Image & Video Generator API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check your connection string
   - For Atlas: Ensure your IP is whitelisted

2. **OpenAI API Error**
   - Verify your API key is correct
   - Check your OpenAI account has credits
   - Ensure the key has the right permissions

3. **Cloudinary Upload Error**
   - Verify your Cloudinary credentials
   - Check your account has available storage/bandwidth

4. **JWT Error**
   - Make sure JWT_SECRET is set
   - Use a strong, random secret

## Optional Environment Variables

For additional features, you can add:

```env
# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# AWS S3 Configuration (alternative to Cloudinary)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
``` 