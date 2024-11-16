chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showNotification") {
        const { fileName, fileSize } = message.data;

        // Display notification details in the console (optional)
        console.log(`Duplicate Detected: ${fileName}, Size: ${fileSize} bytes`);

        // Update the popup content dynamically (optional for more details)
        document.querySelector(".notification").textContent = 
            `Duplicate File Detected!\nFile: ${fileName}\nSize: ${fileSize} bytes`;

        sendResponse({ success: true });
    }
});
