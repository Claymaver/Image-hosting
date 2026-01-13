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
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
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
        
        // Get contents of images directory
        let contents = [];
        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path: 'images',
                ref: branch
            });
            contents = Array.isArray(data) ? data : [data];
        } catch (error) {
            // Directory doesn't exist yet or is empty
            if (error.status === 404) {
                return res.status(200).json({ images: [] });
            }
            throw error;
        }
        
        // Filter for image files only
        const imageFiles = contents.filter(file => 
            file.type === 'file' && 
            /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
        );
        
        // Get commit info for each file to get upload date
        const images = await Promise.all(imageFiles.map(async (file) => {
            try {
                // Get commits for this file
                const { data: commits } = await octokit.repos.listCommits({
                    owner,
                    repo,
                    path: file.path,
                    per_page: 1
                });
                
                const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                
                return {
                    name: file.name,
                    url: rawUrl,
                    size: file.size,
                    date: commits[0]?.commit?.author?.date || new Date().toISOString(),
                    sha: file.sha
                };
            } catch (error) {
                console.error(`Error getting info for ${file.name}:`, error);
                return null;
            }
        }));
        
        // Filter out any null results and sort by date (newest first)
        const validImages = images
            .filter(img => img !== null)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.status(200).json({ images: validImages });
        
    } catch (error) {
        console.error('List images error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to list images'
        });
    }
};
