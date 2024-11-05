document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('viewer');

    // Listen for messages from the parent window
    window.addEventListener('message', (event) => {
        if (event.data.action === 'openFile') {
            const filePath = event.data.path;
            // Load the file content (simulated here, implement actual loading logic)
            loadFileContent(filePath);
        }
    });

    function loadFileContent(filePath) {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load file: ${response.statusText}`);
                }
                return response.text(); // Read the content as text
            })
            .then(content => {
                editor.value = content; // Set the content to the editor's value
                console.log(`Loaded content from: ${filePath}`);
            })
            .catch(error => {
                console.error('Error loading file:', error);
                editor.value = `Error loading file: ${error.message}`;
            });
    }
});