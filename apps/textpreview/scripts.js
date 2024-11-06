document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('viewer');

    // Listen for messages from the parent window
    window.addEventListener('message', (event) => {
        if (event.data.action === 'openFile') {
            const filePath = event.data.path;
            loadFileContent(filePath);
        }
    });

    function loadFileContent(filePath) {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load file: ${response.statusText}`);
                }
                return response.text();
            })
            .then(content => {
                editor.value = content;
            })
            .catch(error => {
                console.error('Error loading file:', error);
                editor.value = `Error loading file: ${error.message}`;
            });
    }
});