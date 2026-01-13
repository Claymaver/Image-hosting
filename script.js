// Configuration
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadQueue = document.getElementById('uploadQueue');
const galleryGrid = document.getElementById('galleryGrid');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const imageModal = document.getElementById('imageModal');
const modalClose = document.getElementById('modalClose');
const modalImage = document.getElementById('modalImage');
const modalFilename = document.getElementById('modalFilename');
const modalSize = document.getElementById('modalSize');
const modalDimensions = document.getElementById('modalDimensions');
const modalDate = document.getElementById('modalDate');
const copyFeedback = document.getElementById('copyFeedback');

let currentImages = [];
let currentImageData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadGallery();
});

function setupEventListeners() {
    // Upload area
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input
    fileInput.addEventListener('change', handleFileSelect);
    
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
    
    // Delete button
    document.querySelector('.delete-btn').addEventListener('click', handleDelete);
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
    fileInput.value = ''; // Reset input
}

// File handling
function handleFiles(files) {
    files.forEach(file => {
        if (!validateFile(file)) return;
        uploadFile(file);
    });
}

function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        showNotification('Invalid file type. Please upload PNG, JPG, GIF, or WEBP images.', 'error');
        return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
        showNotification(`File ${file.name} exceeds 15MB limit.`, 'error');
        return false;
    }
    
    return true;
}

async function uploadFile(file) {
    const uploadId = Date.now() + Math.random();
    const uploadItem = createUploadItem(file, uploadId);
    uploadQueue.appendChild(uploadItem);
    
    try {
        // Read file as base64
        const base64 = await fileToBase64(file);
        
        // Update progress
        updateUploadProgress(uploadId, 50);
        
        // Upload to server
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: file.name,
                content: base64,
                size: file.size
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        
        const result = await response.json();
        
        // Update progress to complete
        updateUploadProgress(uploadId, 100);
        updateUploadStatus(uploadId, 'Uploaded!', 'success');
        
        // Remove upload item after delay
        setTimeout(() => {
            uploadItem.remove();
            loadGallery(); // Refresh gallery
        }, 2000);
        
    } catch (error) {
        console.error('Upload error:', error);
        updateUploadStatus(uploadId, error.message, 'error');
    }
}

function createUploadItem(file, uploadId) {
    const div = document.createElement('div');
    div.className = 'upload-item';
    div.dataset.uploadId = uploadId;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        div.innerHTML = `
            <img src="${e.target.result}" alt="${file.name}">
            <div class="upload-item-info">
                <div class="upload-item-name">${file.name}</div>
                <div class="upload-item-size">${formatFileSize(file.size)}</div>
                <div class="upload-progress">
                    <div class="upload-progress-bar" style="width: 0%"></div>
                </div>
            </div>
            <div class="upload-status">Uploading...</div>
        `;
    };
    reader.readAsDataURL(file);
    
    return div;
}

function updateUploadProgress(uploadId, percent) {
    const item = document.querySelector(`[data-upload-id="${uploadId}"]`);
    if (item) {
        const progressBar = item.querySelector('.upload-progress-bar');
        progressBar.style.width = percent + '%';
    }
}

function updateUploadStatus(uploadId, message, type) {
    const item = document.querySelector(`[data-upload-id="${uploadId}"]`);
    if (item) {
        const status = item.querySelector('.upload-status');
        status.textContent = message;
        status.className = `upload-status ${type}`;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Gallery functions
async function loadGallery() {
    galleryGrid.innerHTML = '<div class="loading">Loading images...</div>';
    
    try {
        const response = await fetch('/api/images');
        if (!response.ok) throw new Error('Failed to load images');
        
        const data = await response.json();
        currentImages = data.images || [];
        
        displayGallery(currentImages);
    } catch (error) {
        console.error('Gallery load error:', error);
        galleryGrid.innerHTML = '<div class="loading">Failed to load images. Please try again.</div>';
    }
}

function displayGallery(images) {
    if (images.length === 0) {
        galleryGrid.innerHTML = '<div class="loading">No images yet. Upload some to get started!</div>';
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
                <span>${formatDate(image.date)}</span>
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
    modalDate.textContent = formatDate(image.date);
    
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
    showCopyFeedback('Direct link copied!');
}

async function handleCopy(type) {
    if (!currentImageData) return;
    
    let text = '';
    switch (type) {
        case 'direct':
            text = currentImageData.url;
            break;
        case 'markdown':
            text = `![${currentImageData.name}](${currentImageData.url})`;
            break;
        case 'html':
            text = `<img src="${currentImageData.url}" alt="${currentImageData.name}">`;
            break;
    }
    
    await copyToClipboard(text);
    
    const labels = {
        direct: 'Direct link copied!',
        markdown: 'Markdown copied!',
        html: 'HTML copied!'
    };
    showCopyFeedback(labels[type]);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Copy failed:', err);
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
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
    }, 2000);
}

// Delete function
async function handleDelete() {
    if (!currentImageData) return;
    
    if (!confirm(`Are you sure you want to delete ${currentImageData.name}?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: currentImageData.name
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Delete failed');
        }
        
        closeModal();
        loadGallery();
        showNotification('Image deleted successfully', 'success');
    } catch (error) {
        console.error('Delete error:', error);
        showNotification(error.message, 'error');
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
}

function showNotification(message, type) {
    // Simple notification - you could enhance this with a toast library
    alert(message);
}
