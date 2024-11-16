
async function checkForDuplicate(fileMetadata) {
    const response = await fetch("https://your-backend-api.com/checkDuplicate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fileMetadata)
    });
    const result = await response.json();
    return result.isDuplicate ? result : null;
}
