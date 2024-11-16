// chrome.downloads.onCreated.addListener(async (downloadItem) => {
//     try {
//         // Extract file metadata
//         const fileMetadata = {
//             fileName: downloadItem.filename || "Unknown File",
//             fileSize: downloadItem.fileSize || 0,
//             location: downloadItem.id,
//             timestamp: new Date().toISOString(),
//         };

//         console.log("File metadata extracted:", fileMetadata);

//         // Validate file size (e.g., ignore files smaller than 1KB)
//         if (fileMetadata.fileSize < 1024) {
//             console.log("File too small to check for duplicates. Proceeding with download.");
//             return;
//         }

//         // Search existing downloads for duplicates
//         const isDuplicate = await checkForDuplicate(fileMetadata);

//         if (isDuplicate) {
//             // Cancel the download if duplicate
//             await chrome.downloads.cancel(downloadItem.id);

//             console.log(`Duplicate file detected: ${fileMetadata.fileName}`);

//             // Notify the user and trigger the popup
//             chrome.runtime.sendMessage({
//                 action: "showNotification",
//                 data: {
//                     fileName: fileMetadata.fileName,
//                     fileSize: fileMetadata.fileSize,
//                 },
//             });
//         } else {
//             console.log("No duplicate found. Proceeding with download.");
//         }
//     } catch (error) {
//         console.error("Error during duplicate check:", error);
//     }
// });

// // Function to check for duplicates in Chrome downloads
// async function checkForDuplicate(fileMetadata) {
//     return new Promise((resolve) => {
//         chrome.downloads.search({}, (results) => {
//             const duplicate = results.some((file) => {
//                 return file.filename === fileMetadata.fileName && file.fileSize === fileMetadata.fileSize;
//             });

//             resolve(duplicate);
//         });
//     });
// }
function normalizeFileName(fileName) {
    return fileName.replace(/\(\d+\)$/, '').trim();
}

chrome.downloads.onCreated.addListener(async (downloadItem) => {
    try {
        // Extract file metadata
        const fileMetadata = {
            fileName: normalizeFileName(downloadItem.filename) || "Unknown File",
            fileSize: downloadItem.fileSize || 0,
            location: downloadItem.id,
            timestamp: new Date().toISOString(),
        };

        console.log("File metadata extracted:", fileMetadata);

        // Validate file size (e.g., ignore files smaller than 1KB)
        if (fileMetadata.fileSize < 1024) {
            console.log("File too small to check for duplicates. Proceeding with download.");
            return;
        }

        // Search existing downloads for duplicates
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

// Function to check for duplicates in Chrome downloads
async function checkForDuplicate(fileMetadata) {
    return new Promise((resolve) => {
        chrome.downloads.search({}, (results) => {
            const duplicate = results.some((file) => {
                return normalizeFileName(file.filename) === fileMetadata.fileName && file.fileSize === fileMetadata.fileSize;
            });

            resolve(duplicate);
        });
    });
}
