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
        const { filename } = req.body;
        
        if (!filename) {
            return res.status(400).json({ error: 'Missing filename' });
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
        
        const path = `images/${filename}`;
        
        // Get file SHA (required for deletion)
        let sha;
        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path,
                ref: branch
            });
            sha = data.sha;
        } catch (error) {
            if (error.status === 404) {
                return res.status(404).json({ error: 'File not found' });
            }
            throw error;
        }
        
        // Delete the file
        await octokit.repos.deleteFile({
            owner,
            repo,
            path,
            message: `Delete ${filename}`,
            sha: sha,
            branch: branch
        });
        
        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            error: error.message || 'Delete failed'
        });
    }
};
