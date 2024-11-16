// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Mock database for demonstration
let fileDatabase = [
  { fileName: "example.pdf", fileType: "PDF", fileLocation: "/downloads/example.pdf" }
];

// Route to check for duplicatesd
app.post('/checkDuplicate', (req, res) => {
  const { fileName, fileLocation } = req.body;  // Extract file details from the request body

  // Check if the file exists in the "database"
  const file = fileDatabase.find(file => 
    file.fileName === fileName && file.fileLocation === fileLocation
  );

  if (file) {
    // If the file is a duplicate, respond with the file details
    res.json({
      isDuplicate: true,
      fileName: file.fileName,
      fileType: file.fileType,
      fileLocation: file.fileLocation
    });
  } else {
    // If no duplicate found, respond with isDuplicate: false
    res.json({ isDuplicate: false });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
