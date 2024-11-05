document.addEventListener('DOMContentLoaded', () => {
    let currentPath = '/home/'; // Start at the root
    const fileGrid = document.getElementById('fileGrid');
    const pathDisplay = document.getElementById('pathDisplay');

    // Mock filesystem data
    let fileSystem = {
        '/': [
            { name: 'home', isFolder: true }
        ],
        '/home/': [
            { name: 'Documents', isFolder: true },
            { name: 'Photos', isFolder: true },
            { name: 'Videos', isFolder: true },
            { name: 'Audio', isFolder: true }
        ],
        '/home/Documents/': [
            { name: 'DemoFolder', isFolder: true },
            { name: 'DemoText-01.txt', isFolder: false, extension: 'txt' },
            { name: 'DemoMD-01.md', isFolder: false, extension: 'md' },
        ],
        '/home/Documents/DemoFolder/': [
            { name: 'DemoCSV-01.csv', isFolder: false, extension: 'csv' },
            { name: 'DemoText-02.txt', isFolder: false, extension: 'txt' },
        ],
        '/home/Photos/': [
            { name: 'Beach.jpg', isFolder: false, extension: 'jpg' },
        ],
        '/home/Audio/': [
            { name: 'Music.mp3', isFolder: false, extension: 'mp3' },
        ],
        '/home/Videos/': [
            { name: 'Video.mp4', isFolder: false, extension: 'mp4' },
        ]
    };

    // Function to display files/folders
    function displayItems(items) {
        fileGrid.innerHTML = ''; // Clear existing items

        // Sort items alphabetically with folders first
        items.sort((a, b) => {
            // Folders are prioritized over files
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            // Alphabetical order
            return a.name.localeCompare(b.name);
        });

        items.forEach(item => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-grid-item');

            // Icon Maps
            const iconMap = {
                'png': 'url(icons/file-png.png)',
                'jpg': 'url(icons/file-jpg.png)',
                'jpeg': 'url(icons/file-jpg.png)',
                'webp': 'url(icons/file-webp.png)',
                'svg': 'url(icons/file-svg.png)',
                'mp3': 'url(icons/file-audio.png)',
                'mp4': 'url(icons/file-video.png)',
                'm4v': 'url(icons/file-video.png)',
                'avi': 'url(icons/file-video.png)',
                'mkv': 'url(icons/file-video.png)',
                'vp8': 'url(icons/file-video.png)',
                'vp9': 'url(icons/file-video.png)',
                'webm': 'url(icons/file-video.png)',
                'txt': 'url(icons/file-txt.png)',
                'md': 'url(icons/file-md.png)',
                'csv': 'url(icons/file-csv.png)',
                'default': 'url(icons/file-icon.png)' // Fallback for unknown file types
            };

            // Create the icon element with conditional background image
            const fileIcon = document.createElement('div');
            fileIcon.classList.add('file-grid-icon');

            // Set the icon based on whether the item is a folder or a specific file type
            if (item.isFolder) {
                fileIcon.style.backgroundImage = 'url(icons/folder-icon.png)';
            } else {
                // Get the file extension and use it to set the background image
                const extension = item.extension.toLowerCase();
                fileIcon.style.backgroundImage = iconMap[extension] || iconMap['default'];
            }

            // File/folder name
            const fileName = document.createElement('span');
            fileName.classList.add('file-grid-name');
            fileName.textContent = item.name;

            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);

            // Click event for navigation
            fileItem.addEventListener('click', () => {
                if (item.isFolder) {
                    currentPath += `${item.name}/`;
                    loadItems(currentPath);
                } else {
                    // Send the file path to the main program
                    window.parent.postMessage({ action: 'openFile', path: `${currentPath}${item.name}` }, '*');
                }
            });

            // Right-click event for the custom context menu
            fileItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showFileContextMenu(e.clientX, e.clientY, item);
            });

            fileGrid.appendChild(fileItem);
        });

        pathDisplay.value = currentPath;
    }

    // Load items from the mock file system
    function loadItems(path) {
        const items = fileSystem[path] || [];
        displayItems(items);
    }

    // Up button functionality
    document.getElementById('upButton').addEventListener('click', () => {
        const parts = currentPath.split('/');
        if (parts.length > 2) {
            parts.pop(); // Remove last folder
            parts.pop(); // Remove trailing slash
            currentPath = parts.join('/') + '/';
            loadItems(currentPath);
        }
    });

    // New Folder button functionality
    document.getElementById('newFolderButton').addEventListener('click', () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            const folderPath = `${currentPath}${folderName}/`;
            if (!fileSystem[currentPath]) {
                fileSystem[currentPath] = [];
            }
            fileSystem[currentPath].push({ name: folderName, isFolder: true });
            fileSystem[folderPath] = [];
            loadItems(currentPath); // Reload items after creating a new folder
        }
    });

    // Show custom context menu for file/folder
    function showFileContextMenu(x, y, item) {
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('custom-context-menu');
        contextMenu.innerHTML = `
            <div class="context-item" data-action="cut">Cut</div>
            <div class="context-item" data-action="copy">Copy</div>
            <div class="context-item" data-action="rename">Rename</div>
            <div class="context-item" data-action="delete">Delete</div>
            <div class="context-item" data-action="properties">Properties</div>
        `;
        document.body.appendChild(contextMenu);
        contextMenu.style.top = `${y}px`;
        contextMenu.style.left = `${x}px`;
        contextMenu.style.position = 'absolute'; // Set absolute position
        contextMenu.style.display = 'block';

        // Context menu actions
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'rename') {
                const newName = prompt('Enter new name:', item.name);
                if (newName) {
                    item.name = newName;
                    loadItems(currentPath);
                }
            } else if (action === 'delete') {
                fileSystem[currentPath] = fileSystem[currentPath].filter(f => f.name !== item.name);
                loadItems(currentPath);
            } else if (action === 'properties') {
                alert(`Properties of ${item.name}`);
            }
            contextMenu.remove(); // Close context menu after action
        });

        // Hide context menu on outside click
        document.addEventListener('click', () => {
            contextMenu.remove();
        }, { once: true });
    }

    // Show custom context menu for empty space
    fileGrid.addEventListener('contextmenu', (e) => {
        if (e.target === fileGrid) {
            e.preventDefault();
            showEmptySpaceContextMenu(e.clientX, e.clientY);
        }
    });

    // Show custom context menu for empty space
    function showEmptySpaceContextMenu(x, y) {
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('custom-context-menu');
        contextMenu.innerHTML = `
            <div class="context-item" data-action="new-folder">New Folder</div>
            <div class="context-item" data-action="new-text-file">New Text File</div>
        `;
        document.body.appendChild(contextMenu);
        contextMenu.style.top = `${y}px`; // Set to mouse Y-coordinate
        contextMenu.style.left = `${x}px`; // Set to mouse X-coordinate
        contextMenu.style.position = 'absolute'; // Set absolute position
        contextMenu.style.display = 'block';

        // Context menu actions
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'new-folder') {
                document.getElementById('newFolderButton').click();
            } else if (action === 'new-text-file') {
                const fileName = prompt('Enter file name:');
                if (fileName) {
                    if (!fileSystem[currentPath]) {
                        fileSystem[currentPath] = [];
                    }
                    fileSystem[currentPath].push({ name: fileName, isFolder: false, extension: 'txt' });
                    loadItems(currentPath);
                }
            }
            contextMenu.remove(); // Close context menu after action
        });

        // Hide context menu on outside click
        document.addEventListener('click', () => {
            contextMenu.remove();
        }, { once: true });
    }

    // Initial load
    loadItems(currentPath);
});
