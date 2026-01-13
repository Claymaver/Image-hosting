const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { filename, content, size } = req.body;
        
        if (!filename || !content) {
            return res.status(400).json({ error: 'Missing filename or content' });
        }
        
        // Validate file size
        const maxSize = 15 * 1024 * 1024; // 15MB
        if (size > maxSize) {
            return res.status(400).json({ error: 'File size exceeds 15MB limit' });
        }
        
        // Initialize Octokit
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });
        
        const owner = process.env.GITHUB_OWNER;
        const repo = process.env.GITHUB_REPO;
        const branch = process.env.GITHUB_BRANCH || 'main';
        
        if (!owner || !repo || !process.env.GITHUB_TOKEN) {
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        // Sanitize filename
        const sanitizedFilename = sanitizeFilename(filename);
        const path = `images/${sanitizedFilename}`;
        
        // Check if file already exists
        let sha = null;
        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch
            });
            sha = data.sha;
        } catch (error) {
            // File doesn't exist, which is fine for new uploads
            if (error.status !== 404) {
                throw error;
            }
        }
        
        // Upload file to GitHub
        const response = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Upload ${sanitizedFilename}`,
            content: content,
            branch: branch,
            ...(sha && { sha }) // Include sha if file exists (update)
        });
        
        // Get the raw URL for the uploaded file
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        
        res.status(200).json({
            success: true,
            url: rawUrl,
            filename: sanitizedFilename
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: error.message || 'Upload failed'
        });
    }
};

function sanitizeFilename(filename) {
    // Remove path traversal attempts and dangerous characters
    let sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Ensure it has an extension
    if (!sanitized.includes('.')) {
        sanitized += '.png';
    }
    
    // Add timestamp to prevent conflicts
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, sanitized.lastIndexOf('.'));
    const timestamp = Date.now();
    
    return `${name}_${timestamp}${ext}`;
}
