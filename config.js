// Configuration management
const CONFIG_KEY = 'imageHostConfig';

function getConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return null;
}

function saveConfig(owner, repo, branch) {
    const config = { owner, repo, branch };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return config;
}

function clearConfig() {
    localStorage.removeItem(CONFIG_KEY);
}

// Check if config exists on page load
document.addEventListener('DOMContentLoaded', () => {
    const config = getConfig();
    if (!config) {
        // Show config modal
        document.getElementById('configModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        // Update repo link
        updateRepoLink(config);
    }
    
    // Config form submission
    document.getElementById('configForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const owner = document.getElementById('configOwner').value.trim();
        const repo = document.getElementById('configRepo').value.trim();
        const branch = document.getElementById('configBranch').value.trim();
        
        if (owner && repo && branch) {
            const config = saveConfig(owner, repo, branch);
            updateRepoLink(config);
            document.getElementById('configModal').classList.remove('active');
            document.body.style.overflow = '';
            
            // Load gallery
            if (window.loadGallery) {
                window.loadGallery();
            }
        }
    });
    
    // Config modal close
    document.getElementById('configModalClose').addEventListener('click', () => {
        const config = getConfig();
        if (config) {
            document.getElementById('configModal').classList.remove('active');
            document.body.style.overflow = '';
        } else {
            alert('Please configure your repository to use the image host.');
        }
    });
});

function updateRepoLink(config) {
    const repoLink = document.getElementById('repoLink');
    if (repoLink && config) {
        repoLink.href = `https://github.com/${config.owner}/${config.repo}/tree/${config.branch}/images`;
    }
}

function getRepoUrl(filename = '') {
    const config = getConfig();
    if (!config) return null;
    
    const { owner, repo } = config;
    const path = filename ? `images/${filename}` : 'images';
    return `https://${owner}.github.io/${repo}/${path}`;
}

function getApiUrl() {
    const config = getConfig();
    if (!config) return null;
    
    const { owner, repo, branch } = config;
    return `https://api.github.com/repos/${owner}/${repo}/contents/images?ref=${branch}`;
}
