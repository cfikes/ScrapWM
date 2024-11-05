const sbus = (() => {
    // Private constants and variables
    const audioSettings = {
        notification: "vfs/system/sounds/NotificationSound-01.mp3",
        email: "vfs/system/sounds/NotificationSound-02.mp3",
        messageCache: "vfs/system/sounds/MessageCache-01.mp3"
    };

    const audioElements = {
        notification: new Audio(audioSettings.notification),
        email: new Audio(audioSettings.email),
        messageCache: new Audio(audioSettings.messageCache)
    };

    // Private helper functions
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function updateSystemCounter(counterType, value) {
        const counter = document.querySelector(`#systemMenu${capitalize(counterType)}Button .systemTrayCounter`);
        if (counter) counter.innerHTML = value;
    }

    function incrementSystemCounter(counterType) {
        const counter = document.querySelector(`#systemMenu${capitalize(counterType)}Button .systemTrayCounter`);
        if (counter) counter.innerHTML = parseInt(counter.innerHTML) + 1;
    }

    function playSound(type) {
        if (audioElements[type]) {
            audioElements[type].play();
        }
    }

    // Public API
    return {
        init: () => {
            // Preload audio files
            Object.values(audioSettings).forEach(filePath => new Audio(filePath).preload = "auto");

            // System Bus for Local Communication
            window.addEventListener("message", ({ data }) => {
                const { bus, content } = data;
                if (bus === "sbus") {
                    console.log("Received message from parent:", data);
                    
                    const sbusMessage = JSON.parse(content);

                    switch (sbusMessage.command) {
                        case "alert":
                            alert(sbusMessage.data);
                            break;

                        case "messageCounterSet":
                        case "emailCounterSet":
                        case "voipCounterSet":
                        case "calendarCounterSet":
                            updateSystemCounter(sbusMessage.command.replace("CounterSet", ""), sbusMessage.data);
                            break;

                        case "messageCounterIncrement":
                            incrementSystemCounter("message");
                            break;

                        case "notificationSound":
                            playSound("notification");
                            break;

                        case "messageCache":
                            playSound("messageCache");
                            break;

                        case "playAudio":
                            playSound(sbusMessage.data);
                            break;

                        default:
                            console.warn("Unknown command:", sbusMessage.command);
                    }
                }
            });
        },

        // Expose counter and audio functions
        incrementSystemCounter,
        updateSystemCounter,
        playSound
    };
})();

// Initialize sbus on DOM load
document.addEventListener('DOMContentLoaded', sbus.init);

// Attach sbus to the global window object
window.sbus = sbus;
