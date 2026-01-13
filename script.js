// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const imageModal = document.getElementById('imageModal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalFilename = document.getElementById('modalFilename');
const modalSize = document.getElementById('modalSize');
const modalDimensions = document.getElementById('modalDimensions');
const copyFeedback = document.getElementById('copyFeedback');

let currentImages = [];
let currentImageData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadGallery();
});

function setupEventListeners() {
    // Gallery controls
    searchInput.addEventListener('input', filterGallery);
    refreshBtn.addEventListener('click', loadGallery);
    
    // Modal
    modalClose.addEventListener('click', closeModal);
    imageModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => handleCopy(btn.dataset.type));
    });
}

// Gallery functions
async function loadGallery() {
    const config = getConfig();
    if (!config) {
        galleryGrid.innerHTML = '<div class="loading">Please configure your repository first.</div>';
        return;
    }
    
    galleryGrid.innerHTML = '<div class="loading">Loading images...</div>';
    
    try {
        const apiUrl = getApiUrl();
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                galleryGrid.innerHTML = '<div class="loading">No images folder found. Create an "images" folder in your repo and add some images!</div>';
                return;
            }
            throw new Error('Failed to load images');
        }
        
        const data = await response.json();
        
        // Filter for image files only
        const imageFiles = data.filter(file => 
            file.type === 'file' && 
            /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)
        );
        
        // Convert to our format
        currentImages = imageFiles.map(file => ({
            name: file.name,
            url: file.download_url,
            size: file.size,
            sha: file.sha
        }));
        
        displayGallery(currentImages);
    } catch (error) {
        console.error('Gallery load error:', error);
        galleryGrid.innerHTML = '<div class="loading">Failed to load images. Make sure your repository is public and the images folder exists.</div>';
    }
}

function displayGallery(images) {
    if (images.length === 0) {
        galleryGrid.innerHTML = '<div class="loading">No images yet. Upload some to your GitHub repo to get started!</div>';
        return;
    }
    
    galleryGrid.innerHTML = '';
    
    images.forEach(image => {
        const item = createGalleryItem(image);
        galleryGrid.appendChild(item);
    });
}

function createGalleryItem(image) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    div.innerHTML = `
        <img src="${image.url}" alt="${image.name}" class="gallery-item-image" loading="lazy">
        <div class="gallery-item-info">
            <div class="gallery-item-name" title="${image.name}">${image.name}</div>
            <div class="gallery-item-meta">
                <span>${formatFileSize(image.size)}</span>
            </div>
            <div class="gallery-item-actions">
                <button class="btn-primary" onclick="copyDirectLink('${image.url}', event)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Link
                </button>
            </div>
        </div>
    `;
    
    div.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            openModal(image);
        }
    });
    
    return div;
}

function filterGallery() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = currentImages.filter(img => 
        img.name.toLowerCase().includes(searchTerm)
    );
    displayGallery(filtered);
}

// Modal functions
function openModal(image) {
    currentImageData = image;
    modalImage.src = image.url;
    modalFilename.textContent = image.name;
    modalSize.textContent = formatFileSize(image.size);
    
    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
        modalDimensions.textContent = `${img.width} × ${img.height}`;
    };
    img.src = image.url;
    
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    imageModal.classList.remove('active');
    document.body.style.overflow = '';
    currentImageData = null;
}

// Copy functions
async function copyDirectLink(url, event) {
    if (event) event.stopPropagation();
    await copyToClipboard(url);
    showNotification('Direct link copied! Perfect for Discord!');
}

async function handleCopy(type) {
    if (!currentImageData) return;
    
    let text = '';
    let message = '';
    
    switch (type) {
        case 'direct':
            text = currentImageData.url;
            message = 'Direct link copied!';
            break;
        case 'markdown':
            text = `![${currentImageData.name}](${currentImageData.url})`;
            message = 'Markdown copied!';
            break;
        case 'html':
            text = `<img src="${currentImageData.url}" alt="${currentImageData.name}">`;
            message = 'HTML copied!';
            break;
        case 'discord':
            text = currentImageData.url;
            message = 'Discord link copied! Just paste it in any channel.';
            break;
    }
    
    await copyToClipboard(text);
    showCopyFeedback(message);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Copy failed:', err);
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showCopyFeedback(message) {
    copyFeedback.textContent = message;
    copyFeedback.className = 'copy-feedback success show';
    
    setTimeout(() => {
        copyFeedback.classList.remove('show');
    }, 3000);
}

function showNotification(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary);
        color: var(--bg-dark);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(110, 255, 127, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
