# 🖼️ Image Host (Git Edition)

A simplified, green-themed image hosting site that uses **GitHub directly** for storage. No file size limits from Vercel - just GitHub's generous 100MB per file limit!

## ✨ Features

- **100MB Max File Size** - GitHub's limit, way better than Vercel's 4.5MB!
- **No Backend Required** - Pure static site, works on GitHub Pages or any static host
- **Discord-Optimized** - Direct image URLs perfect for Discord embeds
- **One-Click Copy** - Quick copy buttons for direct links, Markdown, and HTML
- **Image Gallery** - Beautiful grid view of all your uploaded images
- **Search & Filter** - Easily find images by filename
- **Git-Based Storage** - All images stored in a GitHub repository with version control
- **Modern Green Theme** - Eye-pleasing green color scheme (#6eff7f)

## 🚀 Quick Setup

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new **public** repository
2. Name it `image-storage` (or whatever you want)
3. Create it with a README

### 2. Create the Images Folder

1. In your new repo, click "Add file" → "Create new file"
2. Type: `images/.gitkeep`
3. Click "Commit new file"

### 3. Deploy the Site

**Option A: GitHub Pages (Easiest)**
1. In your repo, go to Settings → Pages
2. Under "Source", select your branch (usually `main`)
3. Upload these files to your repo: `index.html`, `styles.css`, `script.js`, `config.js`
4. Your site will be live at `https://your-username.github.io/image-storage`

**Option B: Vercel (Also Easy)**
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Deploy! No environment variables needed!

**Option C: Netlify**
1. Drag and drop the project folder onto [Netlify Drop](https://app.netlify.com/drop)
2. Done!

### 4. Configure Your Site

1. Visit your deployed site
2. A configuration modal will appear
3. Enter:
   - Your GitHub username
   - Your repository name (`image-storage`)
   - Branch name (`main`)
4. Click "Save Configuration"

That's it! 🎉

## 📤 How to Upload Images

Since this is a static site, you upload images directly to GitHub:

1. Go to your repository on GitHub
2. Navigate to the `images/` folder
3. Click "Add file" → "Upload files"
4. Drag and drop your images (up to 100MB each!)
5. Click "Commit changes"
6. Refresh your image host site to see the new images

## 🎨 Using Your Images

### For Discord
1. Click on any image in the gallery
2. Click "Copy Direct Link" or "Copy for Discord"
3. Paste in Discord - it will auto-embed!

### For Websites
1. Click "Copy HTML" for ready-to-use `<img>` tags
2. Or "Copy Markdown" for markdown files

### Direct URLs
All images are served from GitHub's CDN:
```
https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/images/YOUR_IMAGE.png
```

## 📁 Project Structure

```
image-host/
├── index.html          # Main HTML structure
├── styles.css          # Green-themed styling
├── script.js           # Gallery and image handling
└── config.js           # Repository configuration
```

## 🔧 No Backend Needed!

This version doesn't use:
- ❌ Vercel serverless functions
- ❌ API keys or tokens
- ❌ Environment variables
- ❌ Database

It just reads directly from GitHub's public API!

## ⚙️ Configuration

Your repository configuration is saved in your browser's localStorage, so:
- Each device/browser needs to be configured once
- You can reconfigure by clearing localStorage or editing `config.js`
- No server-side configuration needed

## 🌟 Advantages of This Approach

### vs. Vercel Functions:
- ✅ 100MB file limit instead of 4.5MB
- ✅ No serverless function cold starts
- ✅ Simpler deployment (no environment variables)
- ✅ Works on any static host (GitHub Pages, Netlify, Vercel, etc.)

### vs. Other Image Hosts:
- ✅ Complete control - you own your images
- ✅ Git version history for all uploads
- ✅ Free forever (GitHub's free tier)
- ✅ Fast CDN delivery via GitHub

## 🔐 Security Notes

- Your repository must be **public** for the images to be accessible
- Anyone can view your images (they're public URLs)
- To upload, people need push access to your GitHub repo
- Consider making your repo private if you only want specific people to upload (but images won't be publicly accessible then)

## 🐛 Troubleshooting

**"Failed to load images"**
- Make sure your repository is **public**
- Verify the `images/` folder exists
- Check that you entered the correct username/repo in the config

**Images not appearing after upload**
- Click the "Refresh" button in the gallery
- GitHub's API may take a few seconds to update

**Can't copy links**
- Make sure your browser allows clipboard access
- Try the fallback by selecting the URL manually

## 💡 Tips

1. **Organize your images**: You can create subfolders in the `images/` directory
2. **Name your files well**: Use descriptive names for easy searching
3. **Optimize before uploading**: Compress images to save space and load faster
4. **Use .gitignore**: Add large files you don't want tracked

## 📝 License

MIT - Feel free to use and modify!

---

Made with 💚 and green (#6eff7f)

No servers, no limits (well, 100MB), just pure git! 🚀
