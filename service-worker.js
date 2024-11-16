chrome.downloads.onCreated.addListener(async (downloadItem) => {
    try {
        // Extract file metadata
        const fileMetadata = {
            fileName: downloadItem.filename || "Unknown File", // Default if filename is unavailable
            fileSize: downloadItem.fileSize || 0, // Default to 0 if size is unknown
            location: downloadItem.id, // Download ID for reference
            timestamp: new Date().toISOString(),
        };

        console.log("File metadata extracted:", fileMetadata);

        // Validate file size (e.g., ignore files smaller than 1KB)
        if (fileMetadata.fileSize < 1024) {
            console.log("File too small to check for duplicates. Proceeding with download.");
            return;
        }

        // Call the backend API to check for duplicates
        const isDuplicate = await checkForDuplicate(fileMetadata);

        if (isDuplicate) {
            // Cancel the download if duplicate
            await chrome.downloads.cancel(downloadItem.id);

            console.log(`Duplicate file detected: ${fileMetadata.fileName}`);

            // Notify the user and trigger the popup
            chrome.runtime.sendMessage({
                action: "showNotification",
                data: {
                    fileName: fileMetadata.fileName,
                    fileSize: fileMetadata.fileSize,
                },
            });
        } else {
            console.log("No duplicate found. Proceeding with download.");
        }
    } catch (error) {
        console.error("Error during duplicate check:", error);
    }
});

// Function to communicate with the backend
async function checkForDuplicate(fileMetadata) {
    try {
        const response = await fetch("http://localhost:3000/checkDuplicate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fileMetadata),
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log("Backend response:", result);
        return result.isDuplicate; // Backend returns { isDuplicate: true/false }
    } catch (error) {
        console.error("Error communicating with backend:", error);
        return false; // Default to no duplicate on error
    }
}
