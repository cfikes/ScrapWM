window.addEventListener('message', (event) => {
    if (event.data.action === 'openFile' && event.data.path) {
        const filePath = event.data.path;

        // Set the audio src to the selected file
        const audioPreview = document.getElementById('audiopreview');
        audioPreview.src = filePath;
        audioPreview.load(); // Reload the audio source
        audioPreview.play(); // Autoplay when the file is set
    }
});

// When DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const testAudio = ''; // Set a test audio file if needed
    const audioPreview = document.getElementById('audiopreview');
    if (testAudio) {
        audioPreview.src = testAudio;
        audioPreview.load();
        audioPreview.play();
    }
});
