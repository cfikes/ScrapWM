window.addEventListener('message', (event) => {
    if (event.data.action === 'openFile' && event.data.path) {
        const filePath = event.data.path;
        const photoPreview = document.getElementById('photopreview');
        photoPreview.src = filePath;
    }
});

// When DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const photoPreview = document.getElementById('photopreview');
    photoPreview.src = "icon.png";
});
