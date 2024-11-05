# ScrapWM

Windows Manager and application framework for creating a desktop like experience in the browser.


## Example Applications Included

* About System
  * Installed as System App
  * About ScrapWM and Licensing
* Audio Preview
  * Installed as User Application
  * Has file associations with mp3
  * Plays audio files and integrates into the sbus for file handling
* Calculator
  * Installed as User Application
  * Basic Calculator App
* Developer Help
  * Installed as User Application
  * Incomplete, will have code examples for integration
* File Browser
  * Installed as User Application
  * File browser with a mock filesystem for example only
* Photo Preview
  * Installed as User Application
  * Has file associations with jpg, jpeg, png, gif, webp and svg
  * Previews images and integrates into the sbus for file handling
* Text Preview
  * Installed as User Application
  * Has file associations with txt, csv, and md
  * Views text documents and integrates into the sbus for file handling
* Video Preview
  * Installed as User Application
  * Has file associations with mp4, m4v, vp8, vp9 and avi
  * Plays video files and integrates into the sbus for file handling


## Application Structure
Applications are just html/css/javascript pages that are loaded into an iframe. There are application details that integrate into the window manager to give them more functionality such as message passing, window constraints, icons and so on. Application are "installed" into the system by adding them into the "apps/installedApps.json" for User Applications and "apps/systemApps.json" for applications that appear in the system menu. The structure for this file is the same for both. An array of JSON objects.

```
{
    "data-app-name": "Audio Preview",
    "data-app-url": "apps/audiopreview/index.html",
    "data-app-icon": "apps/audiopreview/icon.png",
    "data-window-title": "Audio Preview",		
    "data-window-statusbar-text": "",
    "data-window-size": "500x120",
    "data-window-minsize": "500x120",
    "data-window-noresize": true,
    "data-multiwindow": true,
    "data-file-associations" : [".mp3", ".wav", ".ogg"],
    "data-subscriptions": []
}
```

### Format of JSON in installedApps.json and systemApps.json
| Property | Description | Type | 
|----------|-------------|------|
| data-app-name | Registered name of the application | string |
| data-app-url | The relative path that the iframe is to load | string |
| data-app-icon | The relative path for the application icon | string |
| data-window-title | The title used for the window | string |
| data-window-statusbar-text | Text to appear in the statusbar of the window | string |
| data-window-size | Initial window size | string in 000x000 format |
| data-window-minsize | Mininum size a window can be resized to | string in 000x000 format | 
| data-window-noresize | Disables window resizing when true | bool |
| data-multiwindow | Prevents multiple instances when true | bool |
| data-file-associations | Array of files extensions the application will open | array[string] |
| data-subscriptions | Value of message subscriptions to be sent to the iframe| array[string] | 

## sbus
The sbus is a simple module that allows the passing of system messages to the window manager. Right now this is to open files with the file handling and play system wide sounds.

Play Notification Sound Example
```
sbus.playSound("notification");
```

### Implemented sbus Calls
| Method | Description |
|--------|-------------|
| playSound("") | Play a sound of types notification,email, or message cache | 
| incrementSystemCounter("") | Increments counters located in systemtray of types calendar, mail, message, and voip. |
| updateSystemCounter("") | Sets counters located in systemtray of types calendar, mail, message and voip | 