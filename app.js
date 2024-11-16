
const express = require("express");
const app = express();
app.use(express.json());

const downloads = [];

app.post("/checkDuplicate", (req, res) => {
    const { fileName, fileSize, location, userId } = req.body;

    const duplicate = downloads.find(
        (file) => file.fileName === fileName && file.fileSize === fileSize && file.userId === userId
    );

    if (duplicate) {
        res.json({ isDuplicate: true, ...duplicate });
    } else {
        downloads.push(req.body);
        res.json({ isDuplicate: false });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
