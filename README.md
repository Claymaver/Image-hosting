# 🖼️ Image Host

A modern, green-themed image hosting site built with GitHub storage and Vercel serverless functions. Perfect for hosting images for Discord embeds and sharing.

## ✨ Features

- **Drag & Drop Upload** - Easy image uploading with drag and drop or click to browse
- **15MB Max File Size** - Support for PNG, JPG, GIF, and WEBP images
- **Discord-Optimized** - Direct image URLs perfect for Discord embeds
- **One-Click Copy** - Quick copy buttons for direct links, Markdown, and HTML
- **Image Gallery** - Beautiful grid view of all your uploaded images
- **Search & Filter** - Easily find images by filename
- **Delete Images** - Remove unwanted images with one click
- **Git-Based Storage** - All images stored in a GitHub repository with version control
- **Modern Green Theme** - Eye-pleasing green color scheme (#6eff7f)

## 🚀 Setup Instructions

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `image-storage` or `my-images`
3. Make it **public** (required for raw image URLs to work)
4. Initialize with a README (optional)

### 2. Generate a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Image Host"
4. Set expiration (or select "No expiration" for convenience)
5. Select these scopes:
   - ✅ **repo** (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### 3. Set Up Vercel

1. Install Vercel CLI (if you haven't):
   ```bash
   npm install -g vercel
   ```

2. Navigate to the project directory:
   ```bash
   cd image-host
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Link to Vercel:
   ```bash
   vercel
   ```
   - Follow the prompts to create a new project
   - Choose the default settings

### 4. Configure Environment Variables

In your Vercel dashboard (or via CLI), add these environment variables:

```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=image-storage
GITHUB_BRANCH=main
```

**Via Vercel Dashboard:**
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add each variable (make sure to add them for Production, Preview, and Development)

**Via CLI:**
```bash
vercel env add GITHUB_TOKEN
vercel env add GITHUB_OWNER
vercel env add GITHUB_REPO
vercel env add GITHUB_BRANCH
```

### 5. Deploy

```bash
vercel --prod
```

Your image host is now live! 🎉

## 📁 Project Structure

```
image-host/
├── index.html          # Main HTML structure
├── styles.css          # Green-themed styling
├── script.js           # Frontend JavaScript
├── api/
│   ├── upload.js       # Upload endpoint
│   ├── images.js       # List images endpoint
│   └── delete.js       # Delete endpoint
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── README.md          # This file
```

## 🎨 Features Explained

### Upload Interface
- Drag and drop images directly onto the upload area
- Click to browse and select multiple images
- Real-time upload progress
- File validation (type and size)
- Preview thumbnails during upload

### Gallery
- Grid view of all uploaded images
- Search functionality to filter by filename
- Click any image to open detailed view
- Responsive design works on all devices

### Image Modal
- Full-size image preview
- File information (size, dimensions, upload date)
- Multiple copy options:
  - **Direct Link** - Raw GitHub URL (perfect for Discord)
  - **Markdown** - `![alt](url)` format
  - **HTML** - `<img>` tag
- Delete functionality

### Discord Integration
The direct image URLs from GitHub work perfectly in Discord because:
- They end in proper image extensions (.png, .jpg, etc.)
- GitHub serves them with correct CORS headers
- They load quickly from GitHub's CDN

## 🔧 Development

Run locally with Vercel dev server:

```bash
npm run dev
```

This starts a local server at `http://localhost:3000` with serverless function support.

## 🌟 Usage Tips

### Uploading Images
1. Drag images onto the upload area or click to browse
2. Wait for upload to complete (you'll see "Uploaded!" status)
3. Images automatically appear in the gallery

### Sharing Images
1. Click on any image in the gallery to open it
2. Click "Copy Direct Link" for the raw URL
3. Paste in Discord, forums, or anywhere else
4. The image will embed automatically!

### Organizing Images
- All images are stored in the `images/` folder in your GitHub repo
- Each upload creates a git commit
- You can view the full history in your GitHub repository
- Images are automatically timestamped to prevent naming conflicts

### Deleting Images
1. Click on the image you want to delete
2. Click the "Delete" button
3. Confirm the deletion
4. The image is removed from GitHub and the gallery

## 🔐 Security Notes

- The GitHub token is stored securely in Vercel environment variables
- It's never exposed to the client/browser
- All API requests go through Vercel serverless functions
- Currently, there's no upload authentication (anyone can upload)
- For production use, consider adding authentication

## 🐛 Troubleshooting

**Images not loading?**
- Make sure your GitHub repository is **public**
- Check that environment variables are set correctly
- Verify the GitHub token has `repo` scope

**Upload failing?**
- Check file size (must be under 15MB)
- Verify file type (PNG, JPG, GIF, WEBP only)
- Check Vercel function logs for errors

**Gallery empty?**
- Images are stored in the `images/` folder in your repo
- Check if the folder exists and contains images
- Try clicking the Refresh button

## 📝 License

MIT - Feel free to use and modify!

## 🙏 Credits

Built with:
- [Octokit](https://github.com/octokit/rest.js) - GitHub API client
- [Vercel](https://vercel.com) - Serverless functions and hosting
- GitHub - Image storage and CDN

---

Made with 💚 and green (#6eff7f)
