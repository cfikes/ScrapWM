window.addEventListener('message', (event) => {
    if (event.data.action === 'openFile' && event.data.path) {
        const filePath = event.data.path;

        // Set the image src to the selected file
        const photoPreview = document.getElementById('videopreview');
        photoPreview.src = filePath;
    }
});

// When DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set the test image as the initial preview
    const testImage = 'https://www.gstatic.com/webp/gallery/1.jpg';
    const photoPreview = document.getElementById('videopreview');
    photoPreview.src = testImage;
});
