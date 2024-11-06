//
// Definitions of Elements
const video = document.getElementById('camera');
const drawCanvas = document.getElementById('draw-canvas');
const ctx = drawCanvas.getContext('2d');
const loadingPopup = document.getElementById('loading-popup');
const pencilTool = document.getElementById('pencil-tool');
const eraserTool = document.getElementById('eraser-tool');
const colorOptions = document.querySelectorAll('.color-option');
const pencilMenu = document.getElementById('pencil-menu');
const eraserMenu = document.getElementById('eraser-menu');
const pipMenu = document.getElementById('pip-menu');
const toolbarIcons = document.querySelectorAll('.toolbar-icon'); // Select all toolbar icons
const toolbar = document.getElementById('toolbar');
const toolbarRect = toolbar.getBoundingClientRect();


const searchInput = document.getElementById('emoji-search-input');
const clearButton = document.getElementById('clear-search');

const cameraSelectMenu = document.getElementById('camera-select-menu');
const resolutionSelectMenu = document.getElementById('resolution-select-menu');
const pipSelectMenu = document.getElementById('pip-select-menu');

//
// Sound Definitions
const shutterSound = new Audio('audio/camera-shutter.wav');
const stampSound = new Audio('audio/stamp.wav');
const buttonSound = new Audio('audio/button.wav');
const popSound = new Audio('audio/pop.wav');

//
//Thickness Definitions
const thickness_extra_thin = 5;
const thickness_thin = 10;
const thickness_medium = 20;
const thickness_thick = 30;
const thickness_extra_thick = 40;

//
// Color Definitions
const colorNameToHex = {
    black: "#000000",
    red: "#FF0000",
    orange: "#FFA500",
    yellow: "#FFFF00",
    green: "#008000",
    blue: "#0000FF",
    purple: "#800080",
    white: "#FFFFFF"
};

//
// Drawing Variables
let isDrawing = false;
let drawColor = 'black';
let drawThickness = thickness_thin;
let isEraser = false;
let eraserThickness = thickness_thin;
let currentZoom = 1;
let rotation = 0;

//
// Camera Variables
let currentCameraId = null;
let currentStream = null;
let cameraStream = null;
let pipActive = false;

//
// Current Selected Tool
let selectedTool = null;

//
// Selected Thickness for sizing tools
let selectedThickness = null;

//
// Movement Variables
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let canvasOffsetX = 0;
let canvasOffsetY = 0;
let initialCanvasOffsetX, initialCanvasOffsetY;

//
// Get Camera Permission
async function requestCameraAccess() {
    try {
        // Request camera access to get permission
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());

        console.log("Camera access granted and stopped.");
    } catch (err) {
        console.error("Error accessing camera:", err);
    }
}

async function requestCameraAndMicrophoneAccess() {
    try {
        // Request both camera and microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());

        console.log("Camera and Microphone access granted and stopped.");
    } catch (err) {
        console.error("Error accessing camera and microphone:", err);
    }
}

//
// Populate resolution options based on selected camera and supported resolutions
async function populateResolutionOptions(deviceId) {
    const capabilities = await getCameraCapabilities(deviceId);

    if (!capabilities) {
        console.error('Could not retrieve camera capabilities');
        return;
    }

    const resolutionOptions = document.getElementById('resolution-options');
    resolutionOptions.innerHTML = ''; // Clear existing options

    // Get the supported width and height ranges from the camera capabilities
    const widthRange = capabilities.width;
    const heightRange = capabilities.height;

    // Define the minimum width threshold (e.g., 600px)
    const minWidthThreshold = 640;
    const step = 256;

    // List of common aspect ratios to generate resolutions
    const aspectRatios = [
        { ratio: 16 / 9, label: 'Widescreen 16:9' },
        { ratio: 4 / 3, label: 'Square 4:3' }
    ];

    // Dynamically generate resolutions for each aspect ratio
    aspectRatios.forEach((aspect) => {
        for (let width = Math.max(widthRange.min, minWidthThreshold); width <= widthRange.max; width += step) {
            const height = Math.floor(width / aspect.ratio);

            // Only add resolutions that are within the camera's height range
            if (height >= heightRange.min && height <= heightRange.max) {
                const option = document.createElement('option');
                option.value = `${width}x${height}`;
                option.text = `${width}x${height} (${aspect.label})`;
                resolutionOptions.appendChild(option);
            }
        }
    });

    // If no resolutions were added, show a message
    if (resolutionOptions.length === 0) {
        const option = document.createElement('option');
        option.text = 'No supported resolutions found';
        resolutionOptions.appendChild(option);
    }
}

// 
// intialize camera and setup video stream and scaling
async function initCamera(deviceId = null, resolution = {}) {
    try {
        // Stop previous stream if it exists
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop()); // Stop previous stream
        }

        // Set video constraints using exact values for the selected resolution
        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                width: resolution.width ? { exact: resolution.width } : undefined,
                height: resolution.height ? { exact: resolution.height } : undefined
            }
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints); // Start camera stream
        video.srcObject = currentStream;

        video.onloadedmetadata = () => {
            drawCanvas.width = video.videoWidth;
            drawCanvas.height = video.videoHeight;
            document.getElementById('camera-container').style.width = `${video.videoWidth}px`;
            document.getElementById('camera-container').style.height = `${video.videoHeight}px`;
        };
    } catch (error) {
        console.error('Error initializing the camera:', error);
    }
}


//
// Begin drawing or erasing when the mouse is down
drawCanvas.addEventListener('mousedown', (e) => {
    // Only allow drawing/erasing if a tool is selected (pencil or eraser)
    if (selectedTool === 'pencil' || selectedTool === 'eraser') {
        isDrawing = true;
        //Begin Drawing
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
        // Drawing/erasing logic
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = isEraser ? null : drawColor;
        ctx.lineWidth = isEraser ? eraserThickness : drawThickness;
        ctx.lineCap = 'round';
        if (isEraser) {
            ctx.clearRect(e.offsetX - eraserThickness / 2, e.offsetY - eraserThickness / 2, eraserThickness, eraserThickness);
        } else {
            ctx.stroke();
        }
    } else if (selectedTool === 'emoji' && selectedEmoji != null) {
        const x = e.offsetX;
        const y = e.offsetY;
        // Save the canvas state before transformation
        ctx.save();
        // Translate to the emoji position (center point of the emoji)
        ctx.translate(x, y);
        // Apply rotation based on the current rotation angle
        const angleInRadians = (rotation * Math.PI) / 180;
        ctx.rotate(angleInRadians);
        // Adjust position for 90 and 270 degrees, since they are flipped
        if (rotation === 90 || rotation === 270) {
            ctx.scale(1, -1); // Flip the emoji vertically
        }
        // Set font and draw the emoji
        ctx.font = emojiSize + 'px Arial'; // Adjust the font size to fit your emoji
        // Measure the width of the emoji to center it properly
        const emojiWidth = ctx.measureText(selectedEmoji).width;
        const emojiHeight = emojiSize; // Approximate the emoji height to the font size
        // Draw the emoji at the center of the click (offset by half the emoji's width and height)
        ctx.fillText(selectedEmoji, -emojiWidth / 2, emojiHeight * 0.41)//(emojiHeight / 2) - (emojiHeight *.09));

        // Play Sound
        stampSound.play();
        // Restore the canvas state to avoid applying rotation/translation to other elements
        ctx.restore();
    } else if (selectedTool === null) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialCanvasOffsetX = canvasOffsetX;
        initialCanvasOffsetY = canvasOffsetY;
    }
});


//
// Handle drawing and erasing on mousemove and if tool is not selected allow dragging
drawCanvas.addEventListener('mousemove', (e) => {
    if (isDrawing && (selectedTool === 'pencil' || selectedTool === 'eraser')) {
        // Drawing/erasing logic
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = isEraser ? null : drawColor;
        ctx.lineWidth = isEraser ? eraserThickness : drawThickness;
        ctx.lineCap = 'round';
        if (isEraser) {
            ctx.clearRect(e.offsetX - eraserThickness / 2, e.offsetY - eraserThickness / 2, eraserThickness, eraserThickness);
        } else {
            ctx.stroke();
        }
    } else if (isDragging && selectedTool === null) {
        // Calculate the drag deltas from the original mouse down position
        let deltaX = e.clientX - dragStartX;
        let deltaY = e.clientY - dragStartY;

        // Update the canvas offsets
        canvasOffsetX = initialCanvasOffsetX + deltaX;
        canvasOffsetY = initialCanvasOffsetY + deltaY;

        // Apply the updated transform with the correct offsets, zoom, and rotation
        video.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom}) rotate(${rotation}deg)`;
        drawCanvas.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom}) rotate(${rotation}deg)`;
    }
});

//
// Set Drawing and Dragging to false on mouseup and finish drawing path
drawCanvas.addEventListener('mouseup', () => {
    ctx.closePath();
    isDrawing = false;
    isDragging = false;
});

//
// Set Drawing and Dragging to false on mouseleave
drawCanvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    isDragging = false;
});


// 
// Function to simulate a mouse event from a touch event
function simulateMouseEvent(event, simulatedType) {
    const touch = event.changedTouches[0]; // Get the first touch point
    
    const simulatedEvent = new MouseEvent(simulatedType, {
        bubbles: true,
        cancelable: true,
        view: window,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0 // Left button for primary mouse events
    });
    // Dispatch the simulated mouse event
    touch.target.dispatchEvent(simulatedEvent);
}

// Map touchstart to mousedown
drawCanvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevent default touch behaviors like scrolling
    simulateMouseEvent(event, 'mousedown');
});
// Map touchmove to mousemove
drawCanvas.addEventListener('touchmove', (event) => {
    event.preventDefault(); // Prevent default touch behaviors
    simulateMouseEvent(event, 'mousemove');
});
// Map touchend to mouseup
drawCanvas.addEventListener('touchend', (event) => {

    simulateMouseEvent(event, 'mouseup');

    // Now move the cursor to the toolbar after the mouseup event is simulated
    setTimeout(() => {
        // Get the toolbar element (replace 'toolbar' with your actual toolbar's ID or class)
        const toolbar = document.getElementById('toolbar'); // Adjust ID as necessary
        if (toolbar) {
            const toolbarRect = toolbar.getBoundingClientRect();

            // Simulate moving the cursor to the center of the toolbar
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: toolbarRect.left + toolbarRect.width / 2,
                clientY: toolbarRect.top + toolbarRect.height / 2
            });

            // Dispatch the event to move the cursor
            document.dispatchEvent(mouseEvent);
        }
    }, 0);

});



    
//
// Pencil tool logic and selection
pencilTool.addEventListener('click', () => {
    if (selectedTool === 'pencil') {
        // Deselect the pencil tool
        pencilMenu.style.display = 'none';
        pencilTool.classList.remove('tool-selected'); // Remove highlight
        selectedTool = null; // Deselect the tool
    } else {
        // Select pencil tool
        hideToolMenus();
        pencilMenu.style.display = 'block';
        selectedTool = 'pencil'; // Set selected tool to pencil
        isEraser = false; // Ensure the tool is in drawing mode
        // Highlight the pencil tool
        removeToolHighlights();
        pencilTool.classList.add('tool-selected');
    }
});

//
// Eraser tool logic and selection
eraserTool.addEventListener('click', () => {
    if (selectedTool === 'eraser') {
        // Deselect the eraser tool
        eraserMenu.style.display = 'none';
        eraserTool.classList.remove('tool-selected'); // Remove highlight
        selectedTool = null; // Deselect the tool
    } else {
        // Select eraser tool
        hideToolMenus();
        eraserMenu.style.display = 'block';
        selectedTool = 'eraser'; // Set selected tool to eraser
        isEraser = true; // Set the mode to erasing
        // Highlight the eraser tool
        removeToolHighlights();
        eraserTool.classList.add('tool-selected');
    }
});

//
// Color selection logic for preset input and drawing color 
colorOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        const selectedColor = e.target.style.color; // Get the color of the clicked option
        const hexColor = colorToHex(selectedColor); // Convert to hex if necessary
        document.getElementById('custom-color').value = hexColor; // Update the custom color input
        drawColor = hexColor; // Set the drawing color to the custom color value
    });
});

//
// Pencil tool size selection logic
document.getElementById('extra-thin-pencil').addEventListener('click', () => {
    updateThicknessSelection('extra-thin-pencil', thickness_extra_thin, "pencil");
});
document.getElementById('thin-pencil').addEventListener('click', () => {
    updateThicknessSelection('thin-pencil', thickness_thin, "pencil");
});
document.getElementById('medium-pencil').addEventListener('click', () => {
    updateThicknessSelection('medium-pencil', thickness_medium, "pencil");
});
document.getElementById('thick-pencil').addEventListener('click', () => {
    updateThicknessSelection('thick-pencil', thickness_thick, "pencil");
});
document.getElementById('extra-thick-pencil').addEventListener('click', () => {
    updateThicknessSelection('extra-thick-pencil', thickness_extra_thick, "pencil");
});

//
// Eraser tool size selection logic
document.getElementById('extra-thin-eraser').addEventListener('click', () => {
   updateThicknessSelection('extra-thin-eraser', thickness_extra_thin, "eraser"); 
});
document.getElementById('thin-eraser').addEventListener('click', () => {
    updateThicknessSelection('thin-eraser', thickness_thin, "eraser");
});
document.getElementById('medium-eraser').addEventListener('click', () => {
    updateThicknessSelection('medium-eraser', thickness_medium, "eraser");
});
document.getElementById('thick-eraser').addEventListener('click', () => {
    updateThicknessSelection('thick-eraser', thickness_thick, "eraser");
});
document.getElementById('extra-thick-eraser').addEventListener('click', () => {
    updateThicknessSelection('extra-thick-eraser', thickness_extra_thick, "eraser");
});

//
// Emoji tool size selection logic
document.getElementById('extra-small-emoji').addEventListener('click', () => {
    updateThicknessSelection('extra-small-emoji', thickness_extra_thin, "emoji");
});
document.getElementById('small-emoji').addEventListener('click', () => {
    updateThicknessSelection('small-emoji', thickness_thin, "emoji");
});
document.getElementById('medium-emoji').addEventListener('click', () => {
    updateThicknessSelection('medium-emoji', thickness_medium, "emoji");
});
document.getElementById('large-emoji').addEventListener('click', () => {
    updateThicknessSelection('large-emoji', thickness_thick, "emoji");
});
document.getElementById('extra-large-emoji').addEventListener('click', () => {
    updateThicknessSelection('extra-large-emoji', thickness_extra_thick, "emoji");
});

//
// Monitor Custom Color Input for Pencil Tool and Update Draw Color
document.getElementById('custom-color').addEventListener('input', (e) => {
    drawColor = e.target.value; // Update the current draw color to the custom color
});

//
// Monitor Support Button Click and Open Heart Popup
document.getElementById('support').addEventListener('click', () => {
    document.getElementById('heart-popup-menu').style.display = 'block';
});

// 
// Monitor Close Heart Popup Button Click and Close Heart Popup
document.getElementById('close-heart-popup-btn').addEventListener('click', () => {
    document.getElementById('heart-popup-menu').style.display = 'none';
});

//
// Monitor Zoom Out Button Click and Zoom Out
document.getElementById('zoom-out').addEventListener('click', () => {
    currentZoom = Math.max(0.25, currentZoom - 0.1);
    applyCanvasAndVideoTransform();
    resizePreview();
});

//
// Monitor Zoom In Button Click and Zoom In
document.getElementById('zoom-in').addEventListener('click', () => {
    currentZoom = Math.min(4, currentZoom + 0.1);
    applyCanvasAndVideoTransform();
    resizePreview();
});

//
// Monitor Zoom Reset Button Click and Reset Zoom
document.getElementById('zoom-reset').addEventListener('click', () => {
    currentZoom = 1;

    // Reset the position offsets to default (centered position)
    canvasOffsetX = 0;
    canvasOffsetY = 0;

    // Apply the zoom and position reset to both video and canvas
    video.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom}) rotate(${rotation}deg)`;
    drawCanvas.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom}) rotate(${rotation}deg)`;
    resizePreview
});
    
//
// Monitor Mouse Wheel Events to Zoom In and Out
drawCanvas.addEventListener('wheel', (event) => {
    event.preventDefault(); // Prevent default scrolling behavior
    
    // Determine zoom direction: up = zoom in, down = zoom out
    if (event.deltaY < 0) {
        currentZoom = Math.min(4, currentZoom + 0.1); // Zoom in
    } else {
        currentZoom = Math.max(0.25, currentZoom - 0.1); // Zoom out
    }

    // Apply the zoom changes to both video and canvas
    applyCanvasAndVideoTransform();
    resizePreview();
});

//
// Monitor Rotate Button and Rotate Canvas and Video by 90 degrees clockwise 
document.getElementById('rotate').addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    applyCanvasAndVideoTransform();
});

// 
// Monitor Fullscreen Button and Fullscreen
document.getElementById('fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

//
// Monitor Clear Screen Button and Clear Canvas
document.getElementById('clear-screen').addEventListener('click', () => {
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
});

//
// Monitor Select Camera Button and Show Camera Selection Menu
document.getElementById('camera-select').addEventListener('click', () => {
    getCameras();
});

//
// Monitor Select Camera Button From Camera Selection Menu
document.getElementById('select-camera-btn').addEventListener('click', async () => {
    const selectedCameraId = document.getElementById('camera-options').value;
    currentCameraId = selectedCameraId; // Store the selected camera

    cameraSelectMenu.style.display = 'none';
    showLoadingSpinner();

    // Populate supported resolutions for the selected camera
    await populateResolutionOptions(currentCameraId);

    hideLoadingSpinner();
    resolutionSelectMenu.style.display = 'block'; // Show the resolution select menu
});


//
// Cancel Camera Selection
document.getElementById('cancel-camera-btn').addEventListener('click', () => {
    cameraSelectMenu.style.display = 'none';
});

//
// Pause Video Button
document.getElementById('camera-pause').addEventListener('click', () => {
    if (video.paused) {
        document.getElementById('camera-pause').classList.remove('tool-selected');
        video.play();
    } else {
        document.getElementById('camera-pause').classList.add('tool-selected');
        video.pause();
    }
});

// Monitor Save Button Click and Save Image
document.getElementById('save-image').addEventListener('click', () => {
    // Flash the screen white for 1/8 of a second (125ms)
    const flashOverlay = document.getElementById('flash-overlay');
    
    // Make the overlay visible by changing opacity
    flashOverlay.style.opacity = .90;

    // Hide the overlay after 1/8 of a second (125ms)
    requestAnimationFrame(() => {
        setTimeout(() => {
            flashOverlay.style.opacity = 0;
            // Play the shutter sound
            shutterSound.play();
        }, 125); 

        // Create a temporary canvas to combine video and drawing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Calculate the new dimensions to account for rotation (hypotenuse)
        const width = video.videoWidth;
        const height = video.videoHeight;
        const maxDimension = Math.sqrt(width * width + height * height); // Diagonal length for rotated canvas
        
        // Set the temporary canvas dimensions to the maximum size needed to avoid clipping
        tempCanvas.width = maxDimension;
        tempCanvas.height = maxDimension;

        // Apply transformations (rotate and zoom)
        tempCtx.translate(maxDimension / 2, maxDimension / 2);  // Move origin to center for rotation
        tempCtx.rotate((rotation * Math.PI) / 180);  // Apply current rotation
        tempCtx.scale(currentZoom, currentZoom);  // Apply current zoom

        // Draw the video onto the temporary canvas, taking into account rotation and zoom
        tempCtx.drawImage(video, -width / 2, -height / 2, width, height);

        // Draw the existing canvas drawing on top of the video, with the same transformations
        tempCtx.drawImage(drawCanvas, -width / 2, -height / 2, width, height);

        // Convert the canvas to a data URL and trigger download
        const link = document.createElement('a');
        link.href = tempCanvas.toDataURL('image/png');
        link.download = 'DocCam-Screenshot.png';  // Filename for the download
        link.click();  // Trigger download
    });
});

//
// Display spinner popup while detecting resolutions
function showLoadingSpinner() {
    loadingPopup.style.display = 'block';
}

//
// Hide spinner popup
function hideLoadingSpinner() {
    loadingPopup.style.display = 'none';
}

//
// Helper Function to apply canvas and video transform
function applyCanvasAndVideoTransform() {
    video.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom}) rotate(${rotation}deg)`;
    drawCanvas.style.transform = `translate(${canvasOffsetX}px, ${canvasOffsetY}px) scale(${currentZoom}) rotate(${rotation}deg)`;
}

//
// Helper Function to convert color name to hex
function colorToHex(color) {
    // Check if it's a color name like 'purple' and return the hex value
    if (colorNameToHex[color.toLowerCase()]) {
        return colorNameToHex[color.toLowerCase()];
    }

    // If it is already in rgb format, convert it to hex using rgbToHex
    if (color.startsWith('rgb')) {
        return rgbToHex(color);
    }

    // If it's already a hex code (starting with #), return it
    if (color.startsWith('#')) {
        return color;
    }

    console.error('Unsupported color format:', color);
    return '#000000'; // Fallback to black
}

//
// Helper Function to convert rgb to hex
function rgbToHex(rgb) {
    const rgbArray = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    
    if (!rgbArray) {
        console.error('Invalid RGB color format:', rgb);
        return '#000000'; // Fallback to black if the format is invalid
    }

    // Convert each RGB component to Hex
    const r = parseInt(rgbArray[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbArray[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbArray[3], 10).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`; // Return the hex value
}

//
// Update Thickness Selection with Emoji Sizing
function updateThicknessSelection(thicknessId, thicknessValue, tool = "none") {
    // Remove all thickness selection for the active tool
    if (tool === "pencil") {
        // Clear all pencil thickness selections
        document.getElementById('extra-thin-pencil').classList.remove('thickness-selected');
        document.getElementById('thin-pencil').classList.remove('thickness-selected');
        document.getElementById('medium-pencil').classList.remove('thickness-selected');
        document.getElementById('thick-pencil').classList.remove('thickness-selected');
        document.getElementById('extra-thick-pencil').classList.remove('thickness-selected');
    } else if (tool === "eraser") {
        // Clear all eraser thickness selections
        document.getElementById('extra-thin-eraser').classList.remove('thickness-selected');
        document.getElementById('thin-eraser').classList.remove('thickness-selected');
        document.getElementById('medium-eraser').classList.remove('thickness-selected');
        document.getElementById('thick-eraser').classList.remove('thickness-selected');
        document.getElementById('extra-thick-eraser').classList.remove('thickness-selected');
    } else if (tool === "emoji") {
        // Clear all emoji size selections
        document.getElementById('extra-small-emoji').classList.remove('thickness-selected');
        document.getElementById('small-emoji').classList.remove('thickness-selected');
        document.getElementById('medium-emoji').classList.remove('thickness-selected');
        document.getElementById('large-emoji').classList.remove('thickness-selected');
        document.getElementById('extra-large-emoji').classList.remove('thickness-selected');
    }

    // Now, apply the thickness-selected class to the correct element
    const thicknessElement = document.getElementById(thicknessId);
    thicknessElement.classList.add('thickness-selected');
    selectedThickness = thicknessElement; // Track the currently selected thickness

    // Set thickness or size based on the tool
    if (tool === "pencil") {
        drawThickness = thicknessValue; // Set pencil thickness
    } else if (tool === "eraser") {
        eraserThickness = thicknessValue * 2; // Set eraser thickness
    } else if (tool === "emoji") {
        emojiSize = thicknessValue * 5; // Set emoji size
    }
}

//
// Build List of Cameras
async function getCameras() {
    try {
        // Enumerate devices after getting permission
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const cameraOptions = document.getElementById('camera-options');
        cameraOptions.innerHTML = ''; // Clear previous options

        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraOptions.length + 1}`;
            cameraOptions.appendChild(option);
        });

        cameraSelectMenu.style.display = 'block'; // Show the camera selection menu
    } catch (err) {
        console.error('Error fetching camera devices:', err);
    }
}

//
// Get Cameras Capabilities, prevents errors
async function getCameraCapabilities(deviceId) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: deviceId }
            }
        });

        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        
        // Stop the stream to release the camera
        videoTrack.stop();

        return capabilities;
    } catch (error) {
        console.error('Error fetching camera capabilities:', error);
        return null;
    }
}

//
// Build List of Camera Resolutions
async function getSupportedResolutions(deviceId) {
    const capabilities = await getCameraCapabilities(deviceId);

    if (!capabilities) {
        return []; // Return an empty array if capabilities can't be fetched
    }

    const widthRange = capabilities.width;
    const heightRange = capabilities.height;

    // Define the resolutions to test
    const testResolutions = [
        // 4K and Ultra HD Resolutions
        { width: 7680, height: 4320, label: "8K UHD" },
        { width: 5120, height: 2880, label: "5K" },
        { width: 4096, height: 2160, label: "DCI 4K" },
        { width: 3840, height: 2160, label: "4K UHD" },
        
        // Quad HD and Wide Quad HD Resolutions
        { width: 3440, height: 1440, label: "WQHD" },
        { width: 2560, height: 1600, label: "WQXGA" },
        { width: 2560, height: 1440, label: "QHD" },
        
        // Full HD and HD Resolutions
        { width: 1920, height: 1200, label: "WUXGA" },
        { width: 1920, height: 1080, label: "Full HD" },
        { width: 1600, height: 900, label: "HD+" },
        
        // Standard HD and VGA Resolutions
        { width: 1440, height: 900, label: "WXGA+" },
        { width: 1366, height: 768, label: "HD Ready" },
        { width: 1280, height: 1024, label: "SXGA" },
        { width: 1280, height: 800, label: "WXGA" },
        { width: 1280, height: 720, label: "HD" },
        
        // XGA and VGA Resolutions
        { width: 1024, height: 768, label: "XGA" },
        { width: 800, height: 600, label: "SVGA" },
        { width: 640, height: 480, label: "VGA" },
    
        // Lower Resolutions
        { width: 480, height: 320, label: "HVGA" },
        { width: 320, height: 240, label: "QVGA" },
        { width: 176, height: 144, label: "QCIF" },
        { width: 160, height: 120, label: "QQVGA" }
    ];
    

    const supportedResolutions = [];

    // Loop through and test each resolution
    for (const res of testResolutions) {
        // Check if the resolution falls within the camera's capability range
        if (res.width >= widthRange.min && res.width <= widthRange.max &&
            res.height >= heightRange.min && res.height <= heightRange.max) {

            // Test this resolution using exact constraints
            const constraints = {
                video: {
                    deviceId: { exact: deviceId },
                    width: { exact: res.width },
                    height: { exact: res.height }
                }
            };

            try {
                // Request the camera stream with this resolution
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const videoTrack = stream.getVideoTracks()[0];
                const settings = videoTrack.getSettings();

                // If the resolution matches the one we requested, add it to the supported resolutions list
                if (settings.width === res.width && settings.height === res.height) {
                    supportedResolutions.push({
                        width: settings.width,
                        height: settings.height,
                        label: res.label
                    });
                }

                // Stop the stream to release the camera
                videoTrack.stop();
            } catch (error) {
                console.log(`Resolution ${res.width}x${res.height} not supported.`);
            }
        }
    }

    return supportedResolutions;
}

document.getElementById('select-resolution-btn').addEventListener('click', () => {
    const selectedResolution = document.getElementById('resolution-options').value.split('x');
    const width = parseInt(selectedResolution[0], 10);
    const height = parseInt(selectedResolution[1], 10);

    if (currentCameraId) {
        initCamera(currentCameraId, { width, height }); // Initialize the camera with the selected resolution
    }

    resolutionSelectMenu.style.display = 'none'; // Hide the resolution select menu
});


//
//Cancel Camera Resolution Selection
document.getElementById('cancel-resolution-btn').addEventListener('click', () => {
    resolutionSelectMenu.style.display = 'none';
});

//
// Get Camera Permission
//
function hasCameraPermission() {
    return navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
    // Permission granted
        stream.getTracks().forEach(track => track.stop()); // Stop the stream
        return true;
    })
    .catch(error => {
    // Permission denied
        return false;
    });
}

function hasCameraAndMicrophonePermission() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            // Permission granted for both camera and microphone
            stream.getTracks().forEach(track => track.stop()); // Stop the stream
            return true;
        })
        .catch(error => {
            // Permission denied for either camera or microphone
            console.error('Permission denied for camera and/or microphone:', error);
            return false;
        });
}

//
// DOMContentLoaded
//
document.addEventListener('DOMContentLoaded', async () => {
    loadCustomEmojis();

    updateThicknessSelection('thin-pencil', thickness_thin, "pencil");
    updateThicknessSelection('thin-eraser', thickness_thin, "eraser");
    updateThicknessSelection('small-emoji', thickness_thin, "emoji");

    //await requestCameraAccess();
    await requestCameraAndMicrophoneAccess();
    
    getCameras().then(() => {
        console.log('Camera access granted!');
    });
});

//
// Emoji Setup
//
const emojiMenu = document.getElementById('emoji-menu');
const emojiTool = document.getElementById('emoji-tool');
const emojiSearchPopup = document.getElementById('emoji-search-popup');

let selectedEmoji = null;
let emojiSize = thickness_thin * 5; // Default size

//
// Emoji selection
//
document.querySelectorAll('.emoji-item').forEach(emojiItem => {
    emojiItem.addEventListener('click', () => {
        // If emoji-item clicked has class of emoji-search-icon do not update selectedEmoji
        if (emojiItem.classList.contains('emoji-search-icon')) {
            return;
        } else {
            selectedEmoji = emojiItem.textContent;
        }
    });
});


//
// Emoji Favorites
//
// Load customizable emojis from localStorage or set to default
function loadCustomEmojis() {
    for (let i = 1; i <= 8; i++) {
        const emojiId = `emojiFav${i}`;
        const savedEmoji = localStorage.getItem(emojiId);
        
        // Only update the emoji if there is one in localStorage
        if (savedEmoji) {
            document.getElementById(emojiId).textContent = savedEmoji;
        }
    }
}
// When the user selects an emoji from the search, update localStorage and display
function setCustomEmoji(emojiId, selectedEmoji) {
    popSound.play();
    localStorage.setItem(emojiId, selectedEmoji);
    document.getElementById(emojiId).textContent = selectedEmoji;
}

// Attach click event to emoji spots with class 'fav-emoji'
document.querySelectorAll('.fav-emoji').forEach(emoji => {
    let pressTimer;
    let isLongPress = false;

    // For mouse devices
    emoji.addEventListener('mousedown', function() {
        event.preventDefault();
        isLongPress = false;

        // Set the long press timer
        pressTimer = setTimeout(() => {
            if (selectedEmoji) {
                setCustomEmoji(this.id, selectedEmoji);
                console.log("Updated Emoji Favorite: " + selectedEmoji);
                isLongPress = true; // Mark it as a long press
            }
        }, 500); // Long press duration set to 500ms
    });

    emoji.addEventListener('mouseup', function() {
        clearTimeout(pressTimer); // Clear the timer if the press is released early

        if (!isLongPress) {
            // It's a normal click, so update selectedEmoji with the clicked emoji
            selectedEmoji = this.textContent;
            console.log("Selected Emoji: " + selectedEmoji);
        }
    });

    emoji.addEventListener('mouseleave', function() {
        clearTimeout(pressTimer); // Clear the timer if the cursor moves away
    });

    // For touch devices
    emoji.addEventListener('touchstart', function() {
        event.preventDefault();
        isLongPress = false;

        // Set the long press timer
        pressTimer = setTimeout(() => {
            if (selectedEmoji) {
                setCustomEmoji(this.id, selectedEmoji);
                console.log("Updated Emoji Favorite: " + selectedEmoji);
                isLongPress = true; // Mark it as a long press
            }
        }, 500);
    });

    emoji.addEventListener('touchend', function() {
        clearTimeout(pressTimer);

        if (!isLongPress) {
            // It's a normal tap, so update selectedEmoji with the tapped emoji
            selectedEmoji = this.textContent;
            console.log("Selected Emoji: " + selectedEmoji);
        }
    });

    emoji.addEventListener('touchmove', function() {
        clearTimeout(pressTimer); // Clear the timer if the touch moves away
    });
});



//
// Emoji tool selection logic
//

emojiTool.addEventListener('click', () => {
    if (selectedTool === 'emoji') {
        // Deselect the emoji tool
        emojiMenu.style.display = 'none';
        // hide search
        emojiSearchPopup.style.display = 'none';
        emojiTool.classList.remove('tool-selected'); // Remove highlight
        selectedTool = null; // Deselect the tool
    } else {
        // Select emoji tool
        hideToolMenus();
        emojiMenu.style.display = 'block';
        selectedTool = 'emoji'; // Set selected tool to emoji
        isEraser = false; // Ensure eraser mode is off

        // Highlight the emoji tool
        removeToolHighlights();
        emojiTool.classList.add('tool-selected');
    }
});

//
// Emoji Searching
//

// Show the clear button when there is text in the search box
searchInput.addEventListener('input', function() {
    if (searchInput.value) {
        clearButton.style.display = 'block';
    } else {
        clearButton.style.display = 'none';
    }
});

// Clear the search input when the clear button is clicked
clearButton.addEventListener('click', function() {
    searchInput.value = '';
    clearButton.style.display = 'none';
    // Optionally trigger a search results reset or clear the results here
    document.getElementById('emoji-search-results').innerHTML = '';
    searchInput.focus(); // Keep focus in the input field
});

let  emojiList = [];
fetch('js/emojidb.json')
    .then(response => response.json())
    .then(data => {
        emojiList = data; // Store the fetched emoji data
    })
    .catch(error => console.error('Error loading emoji list:', error));

document.getElementById('emoji-search').addEventListener('click', () => {
    // Toggle the emoji search popup
    const searchPopup = document.getElementById('emoji-search-popup');
    searchPopup.style.display = searchPopup.style.display === 'none' ? 'block' : 'none';
    document.getElementById('emoji-search-input').focus(); // Focus the input box
});
// Search
document.getElementById('emoji-search-input').addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    // If the search box is empty, clear results
    if (query === '') {
        document.getElementById('emoji-search-results').innerHTML = '';
        return;
    }

    // Split the query into individual words
    const queryWords = query.split(/\s+/); // Split by spaces, handling multiple spaces

    // Perform search on the emojiList based on description, category, and tags
    let results = emojiList;

    queryWords.forEach(word => {
        results = results.filter(item => {
            // Check if the current word matches the description, category, or any tag
            return (
                item.description.toLowerCase().includes(word) || // Check description
                item.category.toLowerCase().includes(word) || // Check category
                item.tags.some(tag => tag.toLowerCase().includes(word)) // Check tags
            );
        });
    });

    // Display the search results, limited to 4 rows of emojis (based on max height)
    displaySearchResults(results);
});
// Search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('emoji-search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    // Limit number of emojis displayed
    results.slice(0, 50).forEach(item => { // 50 emojis = 4 rows of 4 emojis (approx)
        const emojiElement = document.createElement('span');
        emojiElement.textContent = item.emoji;
        emojiElement.classList.add('emoji-item');
        emojiElement.addEventListener('click', () => {
            // Select the emoji and close the popup
            selectedEmoji = item.emoji;
            document.getElementById('emoji-search-popup').style.display = 'none';
            //updateEmojiPreview();
        });
        resultsContainer.appendChild(emojiElement);
    });
}



//
// Eraser Preview
//
const eraserPreviewSpan = document.getElementById('eraser-preview');
// When eraser is selected, show the preview as a pink box outline
drawCanvas.addEventListener('mousemove', (e) => {
    if (selectedTool === 'eraser') {
        drawCanvas.style.cursor = 'none';

        const scaledEraserSize = eraserThickness * currentZoom;

        eraserPreviewSpan.style.left = `${e.pageX}px`;
        eraserPreviewSpan.style.top = `${e.pageY}px`;
        eraserPreviewSpan.style.width = `${scaledEraserSize}px`; // Size of the eraser preview
        eraserPreviewSpan.style.height = `${scaledEraserSize}px`;
        eraserPreviewSpan.style.transform = 'translate(-50%, -50%)'; // Center the box on the cursor
        eraserPreviewSpan.style.display = 'block'; // Show the preview
    }
});
// Hide the eraser preview when mouse leaves the canvas
drawCanvas.addEventListener('mouseleave', () => {
    if (selectedTool === 'eraser') {
        eraserPreviewSpan.style.display = 'none'; // Hide the preview when mouse leaves
        drawCanvas.style.cursor = 'default';
    }
});
// Also hide the eraser preview when the tool is changed from eraser
eraserTool.addEventListener('click', () => {
    if (selectedTool !== 'eraser') {
        eraserPreviewSpan.style.display = 'none'; // Hide if not using eraser tool
    }
});


//
// Pencil Preview
//
const pencilPreviewSpan = document.getElementById('pencil-preview');
// Add mousemove event listener for the pencil preview
drawCanvas.addEventListener('mousemove', (e) => {
    if (selectedTool === 'pencil') {
        drawCanvas.style.cursor = 'none';

        const scaledPencilSize = drawThickness * currentZoom;

        // Use the current drawColor and drawThickness without needing any changes to the prior code
        pencilPreviewSpan.style.width = `${scaledPencilSize}px`; // Set the size based on the thickness
        pencilPreviewSpan.style.height = `${scaledPencilSize}px`;
        pencilPreviewSpan.style.left = `${e.pageX - scaledPencilSize / 2}px`; // Center it on the cursor
        pencilPreviewSpan.style.top = `${e.pageY - scaledPencilSize / 2}px`;
        pencilPreviewSpan.style.borderColor = drawColor; // Update border to match selected color

        // Set crosshatch pattern to match the selected color
        pencilPreviewSpan.style.backgroundColor = drawColor;
        
        pencilPreviewSpan.style.display = 'block'; // Make it visible
    }
});
// Hide the pencil preview when mouse leaves the canvas
drawCanvas.addEventListener('mouseleave', () => {
    if (selectedTool === 'pencil') {
        pencilPreviewSpan.style.display = 'none'; // Hide the preview when mouse leaves
        drawCanvas.style.cursor = 'default';
    }
});
// Also hide the eraser preview when the tool is changed from eraser
eraserTool.addEventListener('click', () => {
    if (selectedTool !== 'pencil') {
        pencilPreviewSpan.style.display = 'none'; // Hide if not using eraser tool
    }
});


//
// Emoji Preview
//
const emojiPreviewSpan = document.getElementById('emoji-preview');
// Add mousemove event listener for the emoji preview
drawCanvas.addEventListener('mousemove', (e) => {
    if (selectedTool === 'emoji' && selectedEmoji !== null) {
        drawCanvas.style.cursor = 'none';
        const scaledEmojiSize = emojiSize * currentZoom; // Scale the emoji size with zoom

        emojiPreviewSpan.style.left = `${e.pageX}px`;
        emojiPreviewSpan.style.top = `${e.pageY}px`;
        emojiPreviewSpan.style.fontSize = `${scaledEmojiSize}px`; // Adjust the font size based on zoom
        emojiPreviewSpan.textContent = selectedEmoji; // Display the selected emoji
        emojiPreviewSpan.style.transform = 'translate(-50%, -50%)'; // Center the emoji on the cursor
        emojiPreviewSpan.style.display = 'block'; // Show the emoji preview
    }
});
// Hide the emoji preview when mouse leaves the canvas
drawCanvas.addEventListener('mouseleave', () => {
    if (selectedTool === 'emoji' && selectedEmoji !== null) {
        emojiPreviewSpan.style.display = 'none'; // Hide the preview when mouse leaves
        drawCanvas.style.cursor = 'default';
    }
});
// Also hide the eraser preview when the tool is changed from eraser
eraserTool.addEventListener('click', () => {
    if (selectedTool !== 'emoji' && selectedEmoji !== null) {
        emojiPreviewSpan.style.display = 'none'; // Hide if not using eraser tool
    }
});


//
// Helper Function to resize PencilSpan, EraserSpan, and EmojiSpan on zoom but the mouse isnt moved.
function resizePreview() {
    if (selectedTool === 'pencil') {
        const scaledPencilSize = drawThickness * currentZoom;
        pencilPreviewSpan.style.width = `${scaledPencilSize}px`; // Set the size based on the thickness
        pencilPreviewSpan.style.height = `${scaledPencilSize}px`;
    } else if (selectedTool === 'eraser') {
        const scaledEraserSize = eraserThickness * currentZoom;
        eraserPreviewSpan.style.width = `${scaledEraserSize}px`; // Set the size based on the thickness
        eraserPreviewSpan.style.height = `${scaledEraserSize}px`;
    } else if (selectedTool === 'emoji') {
        const scaledEmojiSize = emojiSize * currentZoom; // Scale the emoji size with zoom
        emojiPreviewSpan.style.fontSize = `${scaledEmojiSize}px`; // Adjust the font size based on zoom
    }
}

//
// Toolbox functions
const toolboxTool = document.getElementById('toolbox-tool');
const toolboxMenu = document.getElementById('toolbox-menu');



//
// Helper Function Hide all Menus
function hideToolMenus() {
    pencilMenu.style.display = 'none';
    eraserMenu.style.display = 'none';
    emojiMenu.style.display = 'none';
    emojiSearchPopup.style.display = 'none';
    //toolboxMenu.style.display = 'none';
    pencilPreviewSpan.style.display = 'none';
    eraserPreviewSpan.style.display = 'none';
    emojiPreviewSpan.style.display = 'none';
}

//
// remove all highlights
function removeToolHighlights() {
    pencilTool.classList.remove('tool-selected');
    eraserTool.classList.remove('tool-selected');
    emojiTool.classList.remove('tool-selected');
    //toolboxTool.classList.remove('tool-selected');
}



//
// Screen Recording.
// Declare global variables
let isRecording = false;
let mediaRecorder;
let recordedChunks = [];
let displayStream;
let audioStream;
let selectedAudioSourceId = null; // To store the selected audio source ID

// Function to populate audio sources
async function populateAudioSources() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');

        const audioSourceSelect = document.getElementById('audio-source-options');
        audioSourceSelect.innerHTML = ''; // Clear existing options

        if (audioInputDevices.length > 0) {
            audioInputDevices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${audioSourceSelect.length + 1}`;
                audioSourceSelect.appendChild(option);
            });
            // Enable the audio source select
            audioSourceSelect.disabled = false;
        } else {
            // No audio input devices found
            const option = document.createElement('option');
            option.value = '';
            option.text = 'No audio input devices found';
            audioSourceSelect.appendChild(option);
            audioSourceSelect.disabled = true;
            document.getElementById('record-audio-checkbox').checked = false;
            document.getElementById('record-audio-checkbox').disabled = true;
        }
    } catch (err) {
        console.error('Error enumerating audio devices:', err);
    }
}

// Handle the Record Audio checkbox change
document.getElementById('record-audio-checkbox').addEventListener('change', function() {
    const audioSourceSelect = document.getElementById('audio-source-options');
    if (this.checked) {
        audioSourceSelect.disabled = false;
    } else {
        audioSourceSelect.disabled = true;
    }
});

// Function to open the recording options menu
function openRecordingOptionsMenu() {
    // Show the recording options menu
    document.getElementById('recording-options-menu').style.display = 'block';
    // Populate audio sources
    populateAudioSources();
}

// Recording button click handler
document.getElementById('recording-button').addEventListener('click', async function() {
    const recordingButton = document.getElementById('recording-button');
    if (!isRecording) {
        // Open the recording options menu
        openRecordingOptionsMenu();
    } else {
        // Stop recording
        stopRecording();
        isRecording = false;
        // Change icon back to record icon
        recordingButton.classList.remove('fa-stop', 'flashing');
        recordingButton.classList.add('fa-circle');
        recordingButton.style.color = 'red';
    }
});

// Start Recording button in the recording options menu
document.getElementById('start-recording-btn').addEventListener('click', function() {
    // Get selected options
    const recordAudioCheckbox = document.getElementById('record-audio-checkbox');
    const recordAudio = recordAudioCheckbox.checked;

    selectedAudioSourceId = null;
    if (recordAudio) {
        const audioSourceSelect = document.getElementById('audio-source-options');
        selectedAudioSourceId = audioSourceSelect.value;
    }

    // Hide the recording options menu
    document.getElementById('recording-options-menu').style.display = 'none';

    // Start recording with the selected options
    startRecording(recordAudio, selectedAudioSourceId);
    isRecording = true;

    // Change the recording button icon to stop icon
    const recordingButton = document.getElementById('recording-button');
    recordingButton.classList.remove('fa-circle');
    recordingButton.classList.add('fa-stop');
    recordingButton.style.color = 'black'; // Indicate recording is in progress

    // Add the flashing class
    recordingButton.classList.add('flashing');
});

// Cancel button in the recording options menu
document.getElementById('cancel-recording-options-btn').addEventListener('click', function() {
    // Hide the recording options menu
    document.getElementById('recording-options-menu').style.display = 'none';
});

const qualityOptions = {
    "1920x1080-high": { resolution: { width: 1920, height: 1080 }, fps: 30, bitrate: 5000000 },
    "1920x1080-medium": { resolution: { width: 1920, height: 1080 }, fps: 30, bitrate: 2500000 },
    "1920x1080-low": { resolution: { width: 1920, height: 1080 }, fps: 15, bitrate: 1000000 },
    "1280x720-high": { resolution: { width: 1280, height: 720 }, fps: 30, bitrate: 4000000 },
    "1280x720-medium": { resolution: { width: 1280, height: 720 }, fps: 30, bitrate: 2000000 },
    "1280x720-low": { resolution: { width: 1280, height: 720 }, fps: 15, bitrate: 1000000 }
};

async function startRecording(recordAudio, selectedAudioSourceId) {
    recordedChunks = [];
    try {
        // Get selected video quality
        const qualitySelect = document.getElementById('quality-options');
        const selectedQuality = qualitySelect.value;
        const { resolution, fps, bitrate } = qualityOptions[selectedQuality];

        // Prepare video constraints based on selected quality
        const videoConstraints = { width: resolution.width, height: resolution.height, frameRate: fps };

        // Prepare the options with MP4 as preferred MIME type and selected bitrate
        let options = {
            mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
            bitsPerSecond: bitrate // Apply the selected bitrate
        };

        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            // Fallback to WebM
            options = {
                mimeType: 'video/webm; codecs="vp9, opus"',
                bitsPerSecond: bitrate // Apply the selected bitrate
            };
            console.warn('MP4 format not supported, falling back to WebM.');
        }

        // Capture the display (screen)
        let displayMediaOptions = { video: videoConstraints, audio: false };
        if (recordAudio) {
            displayMediaOptions.audio = true; // Request system audio
        }

        // Handle "Cancel" case gracefully
        try {
            displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                console.log('User cancelled the screen share selection or permission was denied.');
                //alert('Screen recording was cancelled. Please try again and select a window to share.');
                // Clean up UI
                isRecording = false;
                const recordingButton = document.getElementById('recording-button');
                recordingButton.classList.remove('fa-stop', 'flashing');
                recordingButton.classList.add('fa-circle');
                recordingButton.style.color = 'red';
                return; // Stop further execution
            } else {
                throw err; // Re-throw other errors
            }
        }

        let combinedStream;

        if (recordAudio) {
            // Capture selected microphone audio
            audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: selectedAudioSourceId ? { exact: selectedAudioSourceId } : undefined
                },
                video: false
            });

            // Check if displayStream contains system audio tracks
            const displayAudioTracks = displayStream.getAudioTracks();
            const hasDisplayAudio = displayAudioTracks.length > 0;

            // Create an audio context and combine video/audio streams
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const destination = audioContext.createMediaStreamDestination();

            // Combine system audio if available
            if (hasDisplayAudio) {
                const systemSource = audioContext.createMediaStreamSource(displayStream);
                systemSource.connect(destination);
            } else {
                console.warn('No system audio available. Proceeding without system audio.');
            }

            // Combine microphone audio if available
            if (audioStream) {
                const micSource = audioContext.createMediaStreamSource(audioStream);
                micSource.connect(destination);
            }

            // Create combined stream with video and audio if available
            combinedStream = new MediaStream([
                ...displayStream.getVideoTracks(),
                ...destination.stream.getAudioTracks()
            ]);
        } else {
            // No audio recording
            combinedStream = new MediaStream([...displayStream.getTracks()]);
        }

        // Initialize the MediaRecorder with the combined stream and specified options
        mediaRecorder = new MediaRecorder(combinedStream, options);

        recordedChunks = [];

        // Handle data availability
        mediaRecorder.ondataavailable = function(e) {
            if (e.data && e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        // Handle recording stop and processing the video (MP4/WebM)
        mediaRecorder.onstop = async function() {
            hideRecordingPopup();

            const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });

            // If recording is WebM, fix duration and save the video
            if (mediaRecorder.mimeType === 'video/webm') {
                const duration = (Date.now() - startTime) / 1000; // Duration in seconds
                console.log("Fixing WebM duration...");

                try {
                    const fixedBlob = await ysFixWebmDuration(blob, duration);
                    saveBlob(fixedBlob, 'DocCam-Recording.webm');
                } catch (error) {
                    console.error("Error while fixing WebM duration:", error);
                }
            } else {
                // For MP4, no fix needed, just save the blob
                saveBlob(blob, 'DocCam-Recording.mp4');
            }

            // Clear the recorded chunks after processing
            recordedChunks = [];
            combinedStream.getTracks().forEach(track => track.stop());
        };

        // Start recording
        mediaRecorder.start();
        startTime = Date.now();
        showRecordingPopup();

    } catch (err) {
        console.error('Error starting screen recording:', err);
        alert('An error occurred while trying to start the screen recording.');
    }
}



function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}



function stopRecording() {
    // Stop the recorder
    mediaRecorder.stop();

    // Stop all media tracks to release resources
    mediaRecorder.stream.getTracks().forEach(track => track.stop());

    // Stop the displayStream tracks (stop screen sharing)
    if (displayStream) {
        displayStream.getTracks().forEach(track => track.stop());
    }

    // Stop the audioStream tracks (stop microphone capture)
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
    }

    isRecording = false;
    const recordingButton = document.getElementById('recording-button');
    recordingButton.classList.remove('fa-stop', 'flashing');
    recordingButton.classList.add('fa-circle');
    recordingButton.style.color = 'red';
}

// Function to fix the metadata
async function fixWebMMetadata(blob) {
    // Read the original WebM blob
    const arrayBuffer = await blob.arrayBuffer();

    // Use the WebM Metadata Fixer library to adjust the metadata
    const fixedArrayBuffer = WebMMetadataFixer.fixWebM(arrayBuffer);

    // Convert the fixed ArrayBuffer back to a Blob
    const fixedBlob = new Blob([fixedArrayBuffer], { type: 'video/webm' });

    // Return the fixed blob
    return fixedBlob;
}

//
// Picture in Picture Handler
const pipContainer = document.getElementById('pip-container');
const pipVideo = document.getElementById('pip');
let pipStream = null; // Track if PiP is active
const expandPipIcon = document.getElementById('expand-pip');
const togglePositionIcon = document.getElementById('toggle-position-pip');
let isExpanded = false; // Track if the PiP video is expanded
let isAtTop = false; // Track if the PiP is at the top position



// Step 1: Populate PiP video sources
async function getAvailableVideoSourcesForPip() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Filter out video sources already in use by other video elements
        const usedDevices = [currentCameraId];
        const availableDevices = videoDevices.filter(device => !usedDevices.includes(device.deviceId));

        const pipOptions = document.getElementById('pip-options');
        pipOptions.innerHTML = ''; // Clear any previous options

        availableDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${pipOptions.length + 1}`;
            pipOptions.appendChild(option);
        });

        document.getElementById('pip-select-menu').style.display = 'block'; // Show PiP camera menu
    } catch (err) {
        console.error('Error fetching available PiP video sources:', err);
    }
}

// Step 2: Get available resolutions for PiP camera
async function getSupportedPipResolutions(deviceId) {
    const capabilities = await getCameraCapabilities(deviceId); // Reuse getCameraCapabilities function

    if (!capabilities) {
        console.error('Could not retrieve PiP camera capabilities');
        return;
    }

    const pipResolutionOptions = document.getElementById('pip-resolution-options');
    pipResolutionOptions.innerHTML = ''; // Clear existing options

    // Get the supported width and height ranges from capabilities
    const widthRange = capabilities.width;
    const heightRange = capabilities.height;

    const minWidthThreshold = 640; // Define a minimum width threshold (e.g., 600px)
    const step = 256; // Step size for width increments

    // Generate resolutions dynamically based on camera capabilities
    for (let width = Math.max(widthRange.min, minWidthThreshold); width <= widthRange.max; width += step) {
        const height = Math.floor(width * (heightRange.max / widthRange.max)); // Maintain aspect ratio

        // Only add resolutions where the height is within the supported range
        if (height >= heightRange.min && height <= heightRange.max) {
            const option = document.createElement('option');
            option.value = `${width}x${height}`;
            option.text = `${width}x${height}`;
            pipResolutionOptions.appendChild(option);
        }
    }

    if (pipResolutionOptions.length === 0) {
        const option = document.createElement('option');
        option.text = 'No supported resolutions found';
        pipResolutionOptions.appendChild(option);
    }

    document.getElementById('pip-resolution-select-menu').style.display = 'block'; // Show PiP resolution menu
}

// Step 3: Initialize PiP video stream with selected resolution
async function initPipCameraWithResolution(deviceId, width, height) {
    try {
        pipStream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: deviceId },
                width: { exact: width },
                height: { exact: height }
            }
        });

        pipVideo.srcObject = pipStream;
        pipVideo.play();
        pipContainer.style.display = 'block'; // Show the PiP container

        console.log(`PiP camera started at ${width}x${height}.`);
    } catch (err) {
        console.error('Error initializing PiP camera with selected resolution:', err);
    }
}

// Step 4: Stop the PiP stream
function stopPip() {
    if (pipStream) {
        pipStream.getTracks().forEach(track => track.stop()); // Stop all tracks of the stream
        pipVideo.srcObject = null; // Clear the video source
        pipContainer.style.display = 'none'; // Hide the PiP container
        pipStream = null; // Clear the reference to the stream
        console.log('PiP stream stopped.');
    }
}

// Step 5: Toggle PiP mode
document.getElementById('pip-menu').addEventListener('click', () => {
    if (pipStream) {
        pipContainer.style.display = 'none';
        // If PiP is active, stop it
        stopPip();
    } else {
        // If PiP is not active, trigger the PiP source selection
        getAvailableVideoSourcesForPip();
    }
});

// Handle PiP camera selection and show resolution options
document.getElementById('select-pip-btn').addEventListener('click', async () => {
    const selectedPipCameraId = document.getElementById('pip-options').value;
    document.getElementById('pip-select-menu').style.display = 'none'; // Hide camera menu
    await getSupportedPipResolutions(selectedPipCameraId); // Load resolutions for the selected PiP camera
});

// Handle PiP resolution selection
document.getElementById('select-pip-resolution-btn').addEventListener('click', () => {
    const selectedResolution = document.getElementById('pip-resolution-options').value.split('x');
    const width = parseInt(selectedResolution[0], 10);
    const height = parseInt(selectedResolution[1], 10);
    const selectedPipCameraId = document.getElementById('pip-options').value;

    document.getElementById('pip-resolution-select-menu').style.display = 'none'; // Hide resolution menu
    initPipCameraWithResolution(selectedPipCameraId, width, height); // Initialize PiP camera with the selected resolution
    pipContainer.style.display = 'block';
});

// Handle PiP menu cancel
document.getElementById('cancel-pip-btn').addEventListener('click', () => {
    document.getElementById('pip-select-menu').style.display = 'none';
});

// Handle PiP resolution menu cancel
document.getElementById('cancel-pip-resolution-btn').addEventListener('click', () => {
    document.getElementById('pip-resolution-select-menu').style.display = 'none';
});

// Toggle function to expand/collapse PiP video
expandPipIcon.addEventListener('click', () => {
    if (isExpanded) {
        // Collapse to original size
        pipContainer.style.width = '320px';
        pipContainer.style.height = '180px';
        pipContainer.style.top = '';   // Remove top positioning
        pipContainer.style.left = '';  // Remove left positioning
        pipContainer.style.bottom = '100px';
        pipContainer.style.right = '20px';
        expandPipIcon.classList.remove('fa-compress');
        expandPipIcon.classList.add('fa-expand');
        // Re-enable toolbar icons
        toggleToolbarIcons(false);
        togglePositionIcon.style.display = 'block';
    } else {
        // Expand PiP video
        pipContainer.style.width = 'calc(100% - 40px)'; // 20px from both left and right
        pipContainer.style.height = 'calc(100% - 120px)'; // 20px from top, 100px from bottom
        //pipContainer.style.top = '20px';
        //pipContainer.style.left = '20px';
        pipContainer.style.bottom = ''; // Remove bottom positioning
        pipContainer.style.right = '';  // Remove right positioning
        expandPipIcon.classList.remove('fa-expand');
        expandPipIcon.classList.add('fa-compress');
        // Re-enable toolbar icons
        toggleToolbarIcons(true);
        togglePositionIcon.style.display = 'none';
        togglePositionIcon.classList.remove('fa-angles-down');
        togglePositionIcon.classList.add('fa-angles-up');
        isAtTop = false;
        selectedTool = null;
    }

    // Toggle the expanded state
    isExpanded = !isExpanded;
});


//
// Toggle Toolbar Icons
function toggleToolbarIcons(disabled) {
    toolbarIcons.forEach(icon => {
        if (disabled) {
            icon.classList.add('disabled'); // Add 'disabled' class to disable icons
            hideToolMenus();
            removeToolHighlights();
        } else {
            icon.classList.remove('disabled'); // Remove 'disabled' class to enable icons
        }
    });
}

// Toggle position of the PiP container between bottom and top
togglePositionIcon.addEventListener('click', () => {
    if (isAtTop) {
        pipContainer.style.top = '';   // Reset top positioning
        pipContainer.style.bottom = '100px'; // Move to bottom
        togglePositionIcon.classList.remove('fa-angles-down');
        togglePositionIcon.classList.add('fa-angles-up');
    } else {
        pipContainer.style.bottom = '';   // Reset bottom positioning
        pipContainer.style.top = '20px';  // Move to top
        togglePositionIcon.classList.remove('fa-angles-up');
        togglePositionIcon.classList.add('fa-angles-down');
    }

    isAtTop = !isAtTop; // Toggle the state
});

//
// Recording PopUP

const recordingPopup = document.getElementById('recording-duration');
const recordingPopupDuration = document.getElementById('recording-info');
let durationInterval;

function showRecordingPopup() {
    const recordingButton = document.getElementById('recording-button');

    // Set the popup position centered above the button before showing it
    const rect = recordingButton.getBoundingClientRect();
    recordingPopup.style.left = `${rect.left + (rect.width / 2)}px`; // center horizontally
    recordingPopup.style.top = `${rect.top - recordingPopup.offsetHeight - 10}px`;

    // Show the popup
    recordingPopup.style.display = 'block';
    
    // Start a timer to update the duration every 100ms and reposition the popup
    durationInterval = setInterval(() => {
        const currentTime = (Date.now() - startTime) / 1000;

        // Recalculate the button's bounding rectangle on every update
        const rect = recordingButton.getBoundingClientRect();

        // Update the popup position to stay centered above the button
        recordingPopup.style.left = `${rect.left + (rect.width / 2)}px`; // center horizontally
        recordingPopup.style.top = `${rect.top - recordingPopup.offsetHeight - 10}px`;

        // Format duration to mm:ss
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update the popup content
        recordingPopupDuration.innerHTML = `${formattedDuration}`;
    }, 100); // Update every 100ms
}

function hideRecordingPopup() {
    // Hide the popup
    clearInterval(durationInterval);
    recordingPopup.style.display = 'none';
}


//
// Monitor Launch Tour button and start the tour

document.getElementById('launch-tour').addEventListener('click', () => {
    startTour();
});


//
// Toggle Tool Bar minimized
document.getElementById('toolbar-toggle').addEventListener('click', function() {
    var toolbar = document.getElementById('toolbar');
    toolbar.classList.toggle('toolbar-minimized');
    
    var toolbarViewControl = document.getElementById('toolbar-view-control');
    toolbarViewControl.classList.toggle('toolbar-view-control-minimized');
    // Optionally, toggle the icon between up and down
    this.classList.toggle('fa-angle-down');
    this.classList.toggle('fa-angle-up');
    
});