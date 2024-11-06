//
// After Dom ready

    // Button Definitions
    const tourCameraSelect = document.getElementById('camera-select');
    const tourPencilTool = document.getElementById('pencil-tool');
    const tourEraserTool = document.getElementById('eraser-tool');
    const tourEmojiTool = document.getElementById('emoji-tool');
    const tourZoomOut = document.getElementById('zoom-out');
    const tourZoomIn = document.getElementById('zoom-in');
    const tourZoomReset = document.getElementById('zoom-reset');
    const tourRotate = document.getElementById('rotate');
    const tourPause = document.getElementById('camera-pause');
    const tourRecord = document.getElementById('recording-button');
    const tourStamp = document.getElementById('stamp-button');
    const tourDraw = document.getElementById('draw-button');
    const tourEmoji = document.getElementById('emoji-button');
    const tourFullscreen = document.getElementById('fullscreen');
    const tourDocCamView = document.getElementById('camera-container');
    const tourSaveImage = document.getElementById('save-image');
    const tourToolbarMinimize = document.getElementById('toolbar-view-control');

    // Tool Menu Definitions
    const tourPencilMenu = document.getElementById('pencil-menu');
    const tourEraserMenu = document.getElementById('eraser-menu');
    const tourEmojiMenu = document.getElementById('emoji-menu');
    const tourPipMenu = document.getElementById('pip-menu');

    // Popup Menu Definitions
    const tourCameraSelectMenu = document.getElementById('camera-select-menu');
    const tourResolutionSelectMenu = document.getElementById('resolution-select-menu');
    const tourRecordingMenu = document.getElementById('recording-options-menu');
    const tourPipSelectMenu = document.getElementById('pip-select-menu');
    const tourSupportMenu = document.getElementById('heart-popup-menu');

    

function startTour() {
    console.log("Start Tour");




    const helpTour = introJs().setOptions({
        steps: [{
            title: 'DocCam V2 Tutorial',
            intro: 'This is a quick tutorial on how to use DocCam V2'
          },
          {
            title: 'Select Camera Button',
            element: tourCameraSelect,
            intro: 'Use this button to open the camera selection menu.'
          },
          {
            title: 'Camera Selection Dialog',
            element: tourCameraSelectMenu,
            intro: 'This is the list of detected document cameras. Pick one from the list to use it.'
          },
          {
            title: 'Resolution Selection Dialog',
            element: tourResolutionSelectMenu,
            intro: 'This is the list of detected document cameras. Higher resolution give more detail, but can make things run slow if you go too high.'
          },
          {
            title: 'Pencil Tool Button',
            element: tourPencilTool,
            intro: 'Use this button to open the pencil menu.'
          },
          {
            title: 'Pencil Menu',
            element: tourPencilMenu,
            intro: 'Change the size of the pencil and pick any color too.'
          },
          {
            title: 'Eraser Tool Button',
            element: tourEraserTool,
            intro: 'Use this button to open the eraser menu.'
          },
          {
            title: 'Eraser Menu',
            element: tourEraserMenu,
            intro: 'Change the size of the eraser, or clear the entire screen with the trash can.'
          },
          {
            title: 'Emoji Tool',
            element: tourEmoji,
            intro: 'Use this button to open the emoji menu.'
          },
          {
            title: 'Emoji Menu',
            element: tourEmojiMenu,
            intro: 'Change the size of the emoji pick an emoji from the list, or use the find more to find well, more. Longpress after selecting your emoji on any of the last 10 emojis to replace it with the current.'
          },
          {
            title: 'Zoom Out',
            element: tourZoomOut,
            intro: 'Use this button to zoom out the image. If you have a high resolution selected, you may need to do this to see the whole document. Mousewheel down works too.'
          },
          {
            title: 'Zoom In',
            element: tourZoomIn,
            intro: 'Use this button to zoom in the image. Mousewheel up works too.'
          },
          {
            title: 'Zoom Reset',
            element: tourZoomReset,
            intro: 'Resets the image to the original zoom and position.'
          },
          {
            title: 'Rotate',
            element: tourRotate,
            intro: 'This button rotates the image clockwise 90 degrees.'
          },
          {
            title: 'Pause Screen',
            element: tourPause,
            intro: 'This button pauses the document camera, but you can still write.'
          },
          {
            title: 'Record Button',
            element: tourRecord,
            intro: 'Use this button to open the recording options menu.'
          },
          { 
            title: 'Recording Options Menu',
            element: tourRecordingMenu,
            intro: 'Set the Recording Options . Use this to select the recording quality and if which audio source. For most recordings the medium quality is more than enough. Recordings save to your Downloads folder.'
          },
          {
            title: 'Save Image',
            element: tourSaveImage,
            intro: 'Use this button to save a PNG image of the document. Downloads the image to your Downloads folder.'
          },
          {
            title: 'PiP Button',
            element: tourPipMenu,
            intro: 'Use this button to open the PiP menu.'
          },
          {
            title: 'PiP Select Menu',
            element: tourPipSelectMenu,
            intro: 'Select the camera you want to use in Picture-in-Picture. Starts up in the bottom right.'
          },
          {
            title: 'Fullscreen Button',
            element: tourFullscreen,
            intro: 'Use this button to enter and exit fullscreen mode.'
          },
          {
            title: 'Toolbar Minimize Button',
            element: tourToolbarMinimize,
            intro: 'Use this button to toggle minimizing the toolbar.'
          },
          {
            title: 'Document Camera View',
            element: tourDocCamView,
            intro: 'This is the main view. When a tool is not selected you can click and drag the view around..'
          },
          {
            title: 'Tour Finished',
            intro: 'Thats a quick tour of how to use DocCam V2. Have fun!',
          }
        ]
    });

    // onBeforeChange and onChange Events
    helpTour.onbeforechange(function(targetElement) {
        const step =  helpTour._currentStep;
        console.log("Before Change Step: " + step);
        hideAllMenusAndPopups();
    });


    helpTour.onchange(function() {
        const step =  helpTour._currentStep;
        console.log("On Change Step: " + step);
        // Step 2 - Show Camera Selection and Explain
        if (step === 2) {
            tourCameraSelectMenu.style.display = 'block';
        }
        // Step 3 - Show Resolution Selection and Explain
        if (step === 3) {
            tourResolutionSelectMenu.style.display = 'block';
        }
        // Step 5 Show Pencil Menu and Explain
        if (step === 5) {
            tourPencilMenu.style.display = 'block';
        }
        // Step 7 Show Eraser Menu and Explain
        if (step === 7) {
            tourEraserMenu.style.display = 'block';
        }
        // Step 9 Show Emoji Menu and Explain
        if (step === 9) {
            tourEmojiMenu.style.display = 'block';
        }
        // Step 16 Show Recording Menu and Explain
        if (step === 16) {
            tourRecordingMenu.style.display = 'block';
        }
        // Step 19 Show Pip Menu and Explain
        if (step === 19) {
            tourPipSelectMenu.style.display = 'block';
        }
        
    }); 

    helpTour.start();

}

function hideAllMenusAndPopups() {
    console.log("Hide All Menus And Popups");

    hideToolMenus();

    tourCameraSelectMenu.style.display = 'none';
    tourResolutionSelectMenu.style.display = 'none';
    tourPipSelectMenu.style.display = 'none';
    tourSupportMenu.style.display = 'none';
    tourRecordingMenu.style.display = 'none';
}