// function normalizeFileName(fileName) {
//     return fileName.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
//                    .replace(/\(\d+\)$/, '') // Remove any trailing (1), (2), etc.
//                    .trim(); // Trim whitespace
// }

// chrome.downloads.onCreated.addListener(async (downloadItem) => {
//     try {
//         // Log the entire structure of the downloadItem
//         console.log("Download Item Structure:", JSON.stringify(downloadItem, null, 2));

//         // Determine the filename
//         let normalizedFileName = downloadItem.filename || "";
//         if (!normalizedFileName) {
//             const url = new URL(downloadItem.finalUrl);
//             normalizedFileName = url.pathname.split('/').pop(); // Get the last part of the URL path
//         }
//         // Decode the filename to handle URL-encoded characters
//         normalizedFileName = decodeURIComponent(normalizedFileName);
//         normalizedFileName = normalizeFileName(normalizedFileName) || "Unknown File";

//         const fileMetadata = {
//             fileName: normalizedFileName,
//             fileSize: downloadItem.fileSize || 0,
//             location: downloadItem.id,
//             timestamp: new Date().toISOString(),
//         };

//         console.log("File Metadata:", fileMetadata);

//         if (fileMetadata.fileSize < 1024) {
//             console.log("File too small to check for duplicates. Proceeding with download.");
//             return;
//         }

//         const isDuplicate = await checkForDuplicate(fileMetadata);

//         if (isDuplicate) {
//             await chrome.downloads.cancel(downloadItem.id);
//             console.log(`Duplicate file detected: ${fileMetadata.fileName}`);

//             chrome.runtime.sendMessage({
//                 action: "showNotification",
//                 data: {
//                     fileName: fileMetadata.fileName,
//                     fileSize: fileMetadata.fileSize,
//                     fileLocation: downloadItem.filename,
//                 },
//             });
//         } else {
//             console.log("No duplicate found. Proceeding with download.");
//         }
//     } catch (error) {
//         console.error("Error during duplicate check:", error);
//     }
// });

function normalizeFileName(fileName) {
    return fileName.replace(/\s+/g, ' ') // Replace multiple spaces with a single space
                   .replace(/\(\d+\)$/, '') // Remove any trailing (1), (2), etc.
                   .trim(); // Trim whitespace
}
function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const file = new File([filePath], "temp"); // Ensure you have the correct file object
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const fileContent = e.target.result;
            const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fileContent));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file); // Ensure you read the file correctly
    });
}


// Function to retrieve stored hashes from chrome.storage.local
async function getStoredHashes() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("fileHashes", (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error accessing chrome.storage.local:", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.fileHashes || []);
            }
        });
    });
}

async function checkForDuplicate(fileMetadata) {
    try {
        const fileHash = await calculateFileHash(fileMetadata.location);

        // Get stored hashes from chrome.storage.local
        const existingHashes = await getStoredHashes();

        if (existingHashes.includes(fileHash)) {
            console.log("Duplicate file detected based on hash:", fileHash);
            return true;
        }

        // Store new file hash if not a duplicate
        existingHashes.push(fileHash);
        chrome.storage.local.set({ fileHashes: existingHashes }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error storing hash in chrome.storage.local:", chrome.runtime.lastError);
            }
        });
        return false;
    } catch (error) {
        console.error("Error checking for duplicate:", error);
        return false;
    }
}

chrome.downloads.onCreated.addListener(async (downloadItem) => {
    try {
        console.log("Download Item Structure:", JSON.stringify(downloadItem, null, 2));

        let normalizedFileName = downloadItem.filename || "";
        if (!normalizedFileName) {
            const url = new URL(downloadItem.finalUrl);
            normalizedFileName = url.pathname.split('/').pop();
        }

        normalizedFileName = decodeURIComponent(normalizedFileName);
        normalizedFileName = normalizeFileName(normalizedFileName) || "Unknown File";

        const fileMetadata = {
            fileName: normalizedFileName,
            fileSize: downloadItem.fileSize || 0,
            location: downloadItem.filename,
            timestamp: new Date().toISOString(),
        };

        console.log("File Metadata:", fileMetadata);

        if (fileMetadata.fileSize < 1024) {
            console.log("File too small to check for duplicates. Proceeding with download.");
            return;
        }

        const isDuplicate = await checkForDuplicate(fileMetadata);

        if (isDuplicate) {
            await chrome.downloads.cancel(downloadItem.id);
            console.log(`Duplicate file detected: ${fileMetadata.fileName}`);

            chrome.runtime.sendMessage({
                action: "showNotification",
                data: {
                    fileName: fileMetadata.fileName,
                    fileSize: fileMetadata.fileSize,
                    fileLocation: downloadItem.filename,
                },
            });
        } else {
            console.log("No duplicate found. Proceeding with download.");
        }
    } catch (error) {
        console.error("Error during duplicate check:", error);
    }
});