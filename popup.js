chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message);
    if (message.action === "showNotification") {
        const { fileName, fileSize, fileLocation } = message.data;

        document.querySelector(".notification").textContent = 
            `Duplicate File Detected!\nFile: ${fileName}\nSize: ${fileSize} bytes\nLocation: ${fileLocation}`;

        sendResponse({ success: true });
    }
});