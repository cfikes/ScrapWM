const desktop = document.getElementById('desktop');

const ZIndexManager = (() => {
    let zIndexCounter = 1;

    return {
        incrementAndGet() {
            return ++zIndexCounter;
        },
    };
})();

const OffsetManager = (() => {
    let offsetX = 0;
    let offsetY = 0;
    const MAX_OFFSET = 64;

    return {
        getNextOffset() {
            const currentOffset = { x: offsetX, y: offsetY };

            // Update offsets for cascading effect
            offsetX = (offsetX + 20) % MAX_OFFSET;
            offsetY = (offsetY + 20) % MAX_OFFSET;

            return currentOffset;
        },
        resetOffsets() {
            offsetX = 0;
            offsetY = 0;
        }
    };
})();

const ClockManager = (() => {
    const systemClock = document.getElementById('systemClock');

    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert to 12-hour format
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        systemClock.textContent = `${displayHours}:${displayMinutes} ${ampm}`;
    }

    // Initialize the clock update interval
    setInterval(updateClock, 1000);

    return {
        updateClock, // Optional: expose updateClock for manual updates
    };
})();


function createWindow(x, y, width, height, minWidth, minHeight, noResize = false) {

    function createSnapPopup() {

        const popupMenu = document.createElement('div');
        popupMenu.id = 'popupMenu';
        popupMenu.classList.add('popup', 'hidden');

        const group1 = document.createElement('div');
        group1.classList.add('snap-group');
        const leftHalf = createSnapOption('left-half');
        const rightHalf = createSnapOption('right-half');
        group1.appendChild(leftHalf);
        group1.appendChild(rightHalf);

        const group2 = document.createElement('div');
        group2.classList.add('snap-group');
        const leftTwoThirds = createSnapOption('left-two-thirds');
        const rightOneThird = createSnapOption('right-one-third');
        group2.appendChild(leftTwoThirds);
        group2.appendChild(rightOneThird);

        const group3 = document.createElement('div');
        group3.classList.add('snap-group');
        const leftThird = createSnapOption('left-third');
        const centerThird = createSnapOption('center-third');
        const rightThird = createSnapOption('right-third');
        group3.appendChild(leftThird);
        group3.appendChild(centerThird);
        group3.appendChild(rightThird);

        popupMenu.appendChild(group1);
        popupMenu.appendChild(group2);
        popupMenu.appendChild(group3);

        popupMenu.style.position = 'absolute';
        popupMenu.style.top = '30px';
        popupMenu.style.left = '10px';
        popupMenu.style.zIndex = '9000';

        return popupMenu;
    }

    function createSnapOption(type) {
        const snapOption = document.createElement('div');
        snapOption.classList.add('snap-option');
        snapOption.setAttribute('data-snap', type);

        return snapOption;
    }

    const newZIndex = ZIndexManager.incrementAndGet();

    const windowContainer = document.createElement('div');
    windowContainer.classList.add('window-container');
    windowContainer.style.left = `${x}px`;
    windowContainer.style.top = `${y}px`;
    windowContainer.style.width = `${width}px`;
    windowContainer.style.height = `${height}px`;
    windowContainer.style.zIndex = newZIndex;

    const windowHeader = document.createElement('div');
    windowHeader.classList.add('window-header');

    const windowHeaderLeft = document.createElement('div');
    windowHeaderLeft.classList.add('window-header-left');
    
    const menuWindowButton = document.createElement('i');
    menuWindowButton.classList.add('fas', 'fa-bars', 'menu-window-button');
    windowHeaderLeft.appendChild(menuWindowButton);

    const windowHeaderCenter = document.createElement('div');
    windowHeaderCenter.classList.add('window-header-center');
    
    const windowAppTitle = document.createElement('span');
    windowAppTitle.classList.add('window-app-title');
    windowAppTitle.textContent = 'Application Title';
    windowHeaderCenter.appendChild(windowAppTitle);

    const closeWrapper = document.createElement('div');
    closeWrapper.classList.add('close-wrapper');

    const minimizeButton = document.createElement('i');
    minimizeButton.classList.add('fas', 'fa-window-minimize', 'minimize-button');
    closeWrapper.appendChild(minimizeButton);

    const defaultSizeButton = document.createElement('i');
    defaultSizeButton.classList.add('fas', 'fa-window-restore', 'default-size-button');
    closeWrapper.appendChild(defaultSizeButton);

    const maximizeButton = document.createElement('i');
    maximizeButton.classList.add('fas', 'fa-window-maximize', 'maximize-button');
    
    const closeButton = document.createElement('i');
    closeButton.classList.add('fas', 'fa-times', 'close-button');
    closeWrapper.appendChild(maximizeButton);
    closeWrapper.appendChild(closeButton);

    windowHeader.appendChild(windowHeaderLeft);
    windowHeader.appendChild(windowHeaderCenter);
    windowHeader.appendChild(closeWrapper);
    windowContainer.appendChild(windowHeader);

    const appContainer = document.createElement('div');
    appContainer.classList.add('app-container');
    windowContainer.appendChild(appContainer);

    const windowStatusbar = document.createElement('div');
    windowStatusbar.classList.add('window-statusbar');

    const statusbarLeft = document.createElement('div');
    statusbarLeft.classList.add('window-statusbar-left');
    
    const resizeHandleLeft = document.createElement('i');
    resizeHandleLeft.classList.add('fas', 'fa-up-right-and-down-left-from-center', 'resize-handle', 'left');
    statusbarLeft.appendChild(resizeHandleLeft);

    const statusbarCenter = document.createElement('div');
    statusbarCenter.classList.add('window-statusbar-center');
    
    const statusbarText = document.createElement('span');
    statusbarText.classList.add('window-statusbar-text');
    statusbarText.textContent = 'Application Text';
    statusbarCenter.appendChild(statusbarText);

    const statusbarRight = document.createElement('div');
    statusbarRight.classList.add('window-statusbar-right');
    
    const resizeHandleRight = document.createElement('i');
    resizeHandleRight.classList.add('fas', 'fa-up-right-and-down-left-from-center', 'resize-handle', 'right');
    statusbarRight.appendChild(resizeHandleRight);

    windowStatusbar.appendChild(statusbarLeft);
    windowStatusbar.appendChild(statusbarCenter);
    windowStatusbar.appendChild(statusbarRight);
    windowContainer.appendChild(windowStatusbar);

    if (noResize) {
        windowContainer.classList.add('no-resize');
    }

    const snapPopup = createSnapPopup();
    windowContainer.appendChild(snapPopup);

    menuWindowButton.addEventListener('click', (event) => {
        event.stopPropagation();
        snapPopup.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!snapPopup.contains(event.target) && event.target !== menuWindowButton) {
            snapPopup.classList.add('hidden');
        }
    });

    setupWindowEvents(windowContainer, appContainer, menuWindowButton, maximizeButton, closeButton, resizeHandleLeft, resizeHandleRight, minWidth, minHeight, width, height, x, y, defaultSizeButton, minimizeButton);

    desktop.appendChild(windowContainer);

    return appContainer;
}


function setupWindowEvents(
    windowContainer,
    appContainer,
    menuWindowButton,
    maximizeButton,
    closeButton,
    resizeHandleLeft,
    resizeHandleRight,
    minWidth,
    minHeight,
    defaultWidth,
    defaultHeight,
    defaultX,
    defaultY,
    defaultSizeButton,
    minimizeButton
) {
    let initialMouseX, initialMouseY;
    let initialLeft, initialTop, initialWidth, initialHeight;
    let activeResizeHandle = null;
    let isMaximized = false;
    let originalSize = { width: 0, height: 0, left: 0, top: 0 };
    let isSnapPopupOpen = false;

    let snapPopup = windowContainer.querySelector('#popupMenu');
    if (!windowContainer.contains(snapPopup)) {
        windowContainer.appendChild(snapPopup);
    }

    function bringToFront(element) {
        const newZIndex = ZIndexManager.incrementAndGet();
        element.style.zIndex = newZIndex;
    }

    function startDragging(e) {
        let isDragging = true;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
        initialLeft = parseFloat(windowContainer.style.left) || 0;
        initialTop = parseFloat(windowContainer.style.top) || 0;

        toggleIframePointerEvents(windowContainer, false);
        document.body.style.userSelect = 'none';
        bringToFront(windowContainer);

        const throttleDrag = (e) => {
            const deltaX = e.clientX - initialMouseX;
            const deltaY = e.clientY - initialMouseY;

            requestAnimationFrame(() => {
                if (isDragging) {
                    windowContainer.style.left = `${initialLeft + deltaX}px`;
                    windowContainer.style.top = `${initialTop + deltaY}px`;
                }
            });
        };

        const stopDragging = () => {
            isDragging = false;
            toggleIframePointerEvents(windowContainer, true);
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', throttleDrag);
            document.removeEventListener('mouseup', stopDragging);
        };

        document.addEventListener('mousemove', throttleDrag, { passive: true });
        document.addEventListener('mouseup', stopDragging);
    }

    function startResizing(e, handle) {
        let isResizing = true;
        activeResizeHandle = handle;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
        initialWidth = windowContainer.offsetWidth;
        initialHeight = windowContainer.offsetHeight;
        initialLeft = parseFloat(windowContainer.style.left) || 0;

        toggleIframePointerEvents(windowContainer, false);
        document.body.style.userSelect = 'none';
        bringToFront(windowContainer);

        const throttleResize = (e) => {
            const deltaX = e.clientX - initialMouseX;
            const deltaY = e.clientY - initialMouseY;

            requestAnimationFrame(() => {
                if (isResizing) {
                    let newWidth, newHeight;

                    if (activeResizeHandle === 'left') {
                        newWidth = Math.max(initialWidth - deltaX, minWidth);
                        windowContainer.style.width = `${newWidth}px`;
                        windowContainer.style.left = `${initialLeft + deltaX}px`;
                    } else if (activeResizeHandle === 'right') {
                        newWidth = Math.max(initialWidth + deltaX, minWidth);
                        windowContainer.style.width = `${newWidth}px`;
                    }

                    newHeight = Math.max(initialHeight + deltaY, minHeight);
                    windowContainer.style.height = `${newHeight}px`;

                    const audioPlayer = appContainer.querySelector('audio');
                    if (audioPlayer) {
                        audioPlayer.style.width = '100%';
                    }
                }
            });
        };

        const stopResizing = () => {
            isResizing = false;
            activeResizeHandle = null;
            toggleIframePointerEvents(windowContainer, true);
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', throttleResize);
            document.removeEventListener('mouseup', stopResizing);
        };

        document.addEventListener('mousemove', throttleResize, { passive: true });
        document.addEventListener('mouseup', stopResizing);
    }

    function toggleIframePointerEvents(container, enable) {
        const iframes = container.getElementsByTagName('iframe');
        for (const iframe of iframes) {
            iframe.style.pointerEvents = enable ? 'auto' : 'none';
        }
    }

    function applySnap(snapType, windowContainer) {
        const width = window.innerWidth;
        const height = document.getElementById('globalHeader').offsetHeight;

        switch (snapType) {
            case 'left-half':
                windowContainer.style.width = `${width / 2}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = '0px';
                windowContainer.style.top = `${height}px`;
                break;
            case 'right-half':
                windowContainer.style.width = `${width / 2}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = `${width / 2}px`;
                windowContainer.style.top = `${height}px`;
                break;
            case 'left-two-thirds':
                windowContainer.style.width = `${(width * 2) / 3}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = '0px';
                windowContainer.style.top = `${height}px`;
                break;
            case 'right-one-third':
                windowContainer.style.width = `${width / 3}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = `${(width * 2) / 3}px`;
                windowContainer.style.top = `${height}px`;
                break;
            case 'left-third':
                windowContainer.style.width = `${width / 3}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = '0px';
                windowContainer.style.top = `${height}px`;
                break;
            case 'center-third':
                windowContainer.style.width = `${width / 3}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = `${width / 3}px`;
                windowContainer.style.top = `${height}px`;
                break;
            case 'right-third':
                windowContainer.style.width = `${width / 3}px`;
                windowContainer.style.height = `calc(100vh - ${height}px)`;
                windowContainer.style.left = `${(width * 2) / 3}px`;
                windowContainer.style.top = `${height}px`;
                break;
            default:
                console.error(`Unknown snap type: ${snapType}`);
        }
    }

    windowContainer.querySelector('.window-header').addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!isMaximized) startDragging(e);
    });

    resizeHandleLeft.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startResizing(e, 'left');
    });

    resizeHandleRight.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startResizing(e, 'right');
    });

    minimizeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        windowContainer.style.display = 'none';
    });

    maximizeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        bringToFront(windowContainer);

        const globalHeaderHeight = document.getElementById('globalHeader').offsetHeight;

        if (!isMaximized) {
            originalSize = {
                width: windowContainer.offsetWidth,
                height: windowContainer.offsetHeight,
                left: windowContainer.style.left,
                top: windowContainer.style.top,
            };

            windowContainer.style.left = '0px';
            windowContainer.style.top = `${globalHeaderHeight}px`;
            windowContainer.style.width = '100vw';
            windowContainer.style.height = `calc(100vh - ${globalHeaderHeight}px)`;
            isMaximized = true;
        } else {
            windowContainer.style.left = originalSize.left;
            windowContainer.style.top = originalSize.top;
            windowContainer.style.width = `${originalSize.width}px`;
            windowContainer.style.height = `${originalSize.height}px`;
            isMaximized = false;
        }
    });

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        windowContainer.remove();
    });

    windowContainer.addEventListener('mousedown', () => {
        bringToFront(windowContainer);
    });

    menuWindowButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!isSnapPopupOpen) {
            snapPopup.classList.remove('hidden');
            isSnapPopupOpen = true;
        } else {
            snapPopup.classList.add('hidden');
            isSnapPopupOpen = false;
        }
    });

    snapPopup.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (
            isSnapPopupOpen &&
            !snapPopup.contains(event.target) &&
            event.target !== menuWindowButton
        ) {
            snapPopup.classList.add('hidden');
            isSnapPopupOpen = false;
        }
    });

    const snapOptions = snapPopup.querySelectorAll('.snap-option');
    snapOptions.forEach(option => {
        option.addEventListener('click', () => {
            const snapType = option.getAttribute('data-snap');
            applySnap(snapType, windowContainer);
            snapPopup.classList.add('hidden');
            isSnapPopupOpen = false;
        });
    });

    defaultSizeButton.addEventListener('click', () => {
        windowContainer.style.left = `${defaultX}px`;
        windowContainer.style.top = `${defaultY}px`;
        windowContainer.style.width = `${defaultWidth}px`;
        windowContainer.style.height = `${defaultHeight}px`;
        isMaximized = false;
    });
}


function launchApp(app, filePath = null) {
    // Make sure the toolbar stays open
    lockToolbarTemporarily();

    const appName = app['data-app-name'];
    const isMultiWindow = app['data-multiwindow'];

    // If multi-window is not allowed and the app is already running, bring it to the front
    if (!isMultiWindow && runningApps[appName] && runningApps[appName].length > 0) {
        const runningInstances = runningApps[appName];
        if (runningInstances.length === 1) {
            bringToFront(runningInstances[0].windowContainer);
            return;
        }
    }

    // Extract app attributes
    const appUrl = app['data-app-url'];
    const windowSize = app['data-window-size'].split('x');
    const windowMinSize = app['data-window-minsize'].split('x');
    let windowNoResize = app['data-window-noresize'] === true;
    const windowTitle = app['data-window-title'];
    const defaultStatusbarText = app['data-window-statusbar-text'];
    const statusbarText = filePath || defaultStatusbarText;

    // Subscriptions for mbus
    const subscriptions = app['data-subscriptions'].join(' ') || '';

    const width = parseInt(windowSize[0]);
    const height = parseInt(windowSize[1]);
    const minWidth = parseInt(windowMinSize[0]);
    const minHeight = parseInt(windowMinSize[1]);

    // Get initial window position using OffsetManager
    const { x, y } = OffsetManager.getNextOffset();

    // Create a new window for the app
    const appContainer = createWindow(x + 100, y + 100, width, height, minWidth, minHeight, windowNoResize);
    const titleElement = appContainer.parentElement.querySelector('.window-app-title');
    const statusbarElement = appContainer.parentElement.querySelector('.window-statusbar-text');

    // Set window title and status bar text
    if (titleElement) titleElement.textContent = windowTitle;
    if (statusbarElement) statusbarElement.textContent = statusbarText;

    // Add an iframe to load the app
    const iframe = document.createElement('iframe');
    iframe.src = appUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.setAttribute('data-subscriptions', subscriptions);
    appContainer.appendChild(iframe);

    const windowContainer = appContainer.parentElement;

    // Store the running app instance
    if (!runningApps[appName]) {
        runningApps[appName] = [];
    }
    runningApps[appName].push({ app, windowContainer });

    // Add the app icon to the toolbar
    addAppToToolbar(app);

    // Handle file loading if provided
    if (filePath) {
        iframe.addEventListener('load', () => {
            iframe.contentWindow.postMessage({ action: 'openFile', path: filePath }, '*');
            // Update status bar with file path
            if (statusbarElement) {
                statusbarElement.textContent = filePath;
            }
        });
    }

    // Add a listener to the close button to remove the app from running apps
    const closeButton = windowContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        // Remove the app instance from runningApps
        runningApps[appName] = runningApps[appName].filter(instance => instance.windowContainer !== windowContainer);

        // Only remove the app icon if no instances are running
        if (runningApps[appName].length === 0) {
            const appIcon = document.getElementById(`running-icon-${appName}`);
            if (appIcon) {
                appIcon.classList.add('bounce-out'); // Trigger bounce-out effect

                // Wait for the animation to complete before removing the icon
                setTimeout(() => {
                    appIcon.remove();
                }, 300); // Match the bounce-out animation duration
            }
        }
    });
}


function addAppToToolbar(app) {
    const runningAppsContainer = document.getElementById('runningApps');
    const appName = app['data-app-name'];
    
    let appIconWrapper = document.getElementById(`running-icon-${appName}`);

    if (!appIconWrapper) {
        const toolbar = document.getElementById('toolbar');
        toolbar.classList.add('locked');

        appIconWrapper = document.createElement('div');
        appIconWrapper.classList.add('running-app-icon');
        appIconWrapper.id = `running-icon-${appName}`;

        const appIcon = document.createElement('img');
        appIcon.src = app['data-app-icon'];
        appIcon.alt = appName;
        appIcon.classList.add('app-icon');

        appIconWrapper.appendChild(appIcon);
        runningAppsContainer.appendChild(appIconWrapper);

        setTimeout(() => {
            toolbar.classList.remove('locked');
        }, 1000);

        setTimeout(() => {
            appIconWrapper.classList.add('visible');
        }, 10);
    }

    appIconWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const instances = runningApps[appName];

        if (instances.length === 1) {
            bringToFront(instances[0].windowContainer);
        } else {
            showAppInstanceMenu(e, appName);
        }

        const toolbar = document.getElementById('toolbar');
        toolbar.classList.add('keep-open');
    });
}


function showAppInstanceMenu(event, appName) {
    const existingMenu = document.querySelector('.custom-context-menu');
    if (existingMenu) existingMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.classList.add('custom-context-menu');

    runningApps[appName].forEach((instance, index) => {
        const menuItem = document.createElement('div');
        menuItem.classList.add('context-item');
        menuItem.textContent = `${String(index + 1).padStart(2, '0')} - ${appName}`;

        menuItem.addEventListener('click', () => {
            bringToFront(instance.windowContainer);
            contextMenu.remove();

            const toolbar = document.getElementById('toolbar');
            toolbar.classList.remove('keep-open');
        });

        contextMenu.appendChild(menuItem);
    });

    contextMenu.style.position = 'absolute';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.display = 'block';
    document.body.appendChild(contextMenu);

    document.addEventListener('click', () => {
        try{
            contextMenu.remove();
            const toolbar = document.getElementById('toolbar');
            toolbar.classList.remove('keep-open');
        }catch(e){
            console.log(e);
        }
    }, { once: true });
}


function lockToolbarTemporarily() {
    const toolbar = document.getElementById('toolbar');
    
    toolbar.classList.add('keep-open');

    setTimeout(() => {
        if (toolbar.classList.contains('keep-open')) {
            toolbar.classList.remove('keep-open');
        }
    }, 1000);
}


function bringToFront(windowContainer) {
    lockToolbarTemporarily();
    const newZIndex = ZIndexManager.incrementAndGet();
    windowContainer.style.zIndex = newZIndex;
    windowContainer.style.display = 'block';
}


document.addEventListener('click', (e) => {
    const toolbar = document.getElementById('toolbar');
    const isClickInsideToolbar = toolbar.contains(e.target);
    if (!isClickInsideToolbar) {
        toolbar.classList.remove('keep-open');
    }
});


window.addEventListener('message', (event) => {
    if (event.data.action === 'openFile') {
        const filePath = event.data.path;

        fetch('apps/installedApps.json')
            .then(response => response.json())
            .then(apps => {
                const app = apps.find(app => app['data-file-associations']
                    && app['data-file-associations'].some(ext => filePath.endsWith(ext)));
                if (app) {
                    vfsPath = "/vfs" + filePath;
                    launchApp(app, vfsPath);
                } else {
                    alert("No app available to open this file type.");
                }
            }).catch(error => console.error('Failed to load installed apps:', error));
    }
});


document.querySelectorAll('.app-shortcut').forEach(shortcut => {
    shortcut.addEventListener('click', (e) => {
        const appUrl = shortcut.getAttribute('data-app-url');
        const windowSize = shortcut.getAttribute('data-window-size').split('x');
        const windowTitle = shortcut.getAttribute('data-window-title');
        const windowMinSize = shortcut.getAttribute('data-window-minsize').split('x');
        const statusbarText = shortcut.getAttribute('data-window-statusbar-text');
        const subscriptionsArray = shortcut.getAttribute('data-subscriptions');
        const subscriptions = subscriptionsArray.join(' ');
        const width = parseInt(windowSize[0]);
        const height = parseInt(windowSize[1]);
        const minWidth = parseInt(windowMinSize[0]);
        const minHeight = parseInt(windowMinSize[1]);
        const appContainer = createWindow(100, 100, width, height, minWidth, minHeight);

        const titleElement = appContainer.parentElement.querySelector('.window-app-title');
        if (titleElement) {
            titleElement.textContent = windowTitle;
        }

        const statusbarElement = appContainer.parentElement.querySelector('.window-statusbar-text');
        if (statusbarElement) {
            statusbarElement.textContent = statusbarText;
        }

        const iframe = document.createElement('iframe');
        iframe.src = appUrl;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.setAttribute('data-subscriptions', subscriptions);
        appContainer.appendChild(iframe);
    });
});


document.getElementById('allApps').addEventListener('click', () => {
    const allAppsWindow = document.querySelector('.window-container[data-app-url="allApps"]');
    if (allAppsWindow) {
        bringToFront(allAppsWindow);
        return;
    }

    const windowWidth = 556;
    const windowHeight = 620;
    const x = (window.innerWidth - windowWidth) / 2;
    const y = (window.innerHeight - windowHeight) / 2;

    const appContainer = createWindow(x, y, windowWidth, windowHeight, 400, 300);

    appContainer.parentElement.setAttribute('data-app-url', 'allApps');

    const titleElement = appContainer.parentElement.querySelector('.window-app-title');
    const statusbarElement = appContainer.parentElement.querySelector('.window-statusbar-text');
    if (titleElement) titleElement.textContent = "All Apps";
    if (statusbarElement) statusbarElement.textContent = "Browse all installed apps";

    const appGrid = document.createElement('div');
    appGrid.classList.add('app-grid');

    const contextMenu = document.createElement('div');
    contextMenu.classList.add('custom-context-menu');
    contextMenu.innerHTML = `
        <div class="context-item" data-action="app-details">App Details</div>    
        <div class="context-item" data-action="add-to-favorites">Add to Favorites</div> 
    `;
    document.body.appendChild(contextMenu);
    contextMenu.style.display = 'none';
    
    fetch('apps/installedApps.json')
        .then(response => response.json())
        .then(apps => {
            apps.sort((a, b) => a['data-app-name'].localeCompare(b['data-app-name']));
            apps.forEach(app => {
                const appWrapper = document.createElement('div');
                appWrapper.classList.add('app-grid-item');

                const appIcon = document.createElement('div');
                appIcon.classList.add('app-grid-icon');
                appIcon.style.backgroundImage = `url(${app['data-app-icon']})`;

                appWrapper.setAttribute('data-app-url', app['data-app-url']);
                appWrapper.setAttribute('data-window-size', app['data-window-size']);
                appWrapper.setAttribute('data-window-minsize', app['data-window-minsize']);
                appWrapper.setAttribute('data-window-title', app['data-window-title']);
                appWrapper.setAttribute('data-window-statusbar-text', app['data-window-statusbar-text']);
                appWrapper.setAttribute('data-subscriptions', app['data-subscriptions']);

                appWrapper.addEventListener('click', () => {
                    launchApp(app);
                });

                appWrapper.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    selectedApp = app;
                    contextMenu.style.top = `${e.clientY}px`;
                    contextMenu.style.left = `${e.clientX}px`;
                    contextMenu.style.display = 'block';
                    contextMenu.dataset.appName = app['data-app-name'];
                });

                const appName = document.createElement('span');
                appName.classList.add('app-grid-name');
                appName.textContent = app['data-app-name'];

                appWrapper.appendChild(appIcon);
                appWrapper.appendChild(appName);

                appGrid.appendChild(appWrapper);
            });
        })
        .catch(error => console.error('Failed to load apps:', error));

        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (selectedApp) {
                if (action === 'add-to-favorites') {
                    alert(`${selectedApp['data-app-name']} added to favorites!`);
                } else if (action === 'app-details') {
                    alert(`App Details:\nName: ${selectedApp['data-app-name']}\nURL: ${selectedApp['data-app-url']}`);
                }
                contextMenu.style.display = 'none';
            }
        });

    appContainer.appendChild(appGrid);
});


document.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent default context menu
});

// System App Menu
document.addEventListener('DOMContentLoaded', () => {
    const systemMenuButton = document.getElementById('systemMenuButton');
    const systemMenu = document.getElementById('systemMenu');

    systemMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = systemMenu.style.display === 'block';
        systemMenu.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!systemMenu.contains(e.target) && e.target !== systemMenuButton) {
            systemMenu.style.display = 'none';
        }
    });

    systemMenuButton.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    

    fetch('apps/systemApps.json')
        .then(response => response.json())
        .then(systemApps => {
            systemApps.forEach(app => {
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item', 'systemMenuItem');
                menuItem.dataset.appName = app['data-app-name'];
                menuItem.dataset.appUrl = app['data-app-url'];

                const icon = document.createElement('i');
                icon.classList.add('menu-item-icon');
                icon.style.backgroundImage = `url(${app['data-app-icon']})`;

                const text = document.createElement('span');
                text.classList.add('menu-item-text');
                text.textContent = ` ${app['data-app-name']}`;

                menuItem.appendChild(icon);
                menuItem.appendChild(text);

                menuItem.addEventListener('click', () => {
                    launchApp(app); 
                    systemMenu.style.display = 'none';
                });

                systemMenu.appendChild(menuItem);
            });
        }).catch(error => console.error('Failed to load systemApps.json:', error)
    );
});