/**
 * Simple script to help upload restaurant photos
 * This creates a temporary upload endpoint for testing
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Upload a local image file to Supabase Storage
 * @param {string} filePath - Path to the image file
 * @param {string} restaurantName - Name of the restaurant
 */
async function uploadRestaurantPhoto(filePath, restaurantName) {
  try {
    console.log(`Uploading photo for ${restaurantName}...`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const sanitizedRestaurantName = restaurantName.replace(/[^a-zA-Z0-9]/g, '_');
    const storagePath = `restaurant-photos/${sanitizedRestaurantName}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('restaurant-images') // You'll need to create this bucket
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(storagePath);

    console.log('✅ Upload successful!');
    console.log(`Public URL: ${urlData.publicUrl}`);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
}

/**
 * Alternative: Create a simple HTTP server for drag-and-drop uploads
 */
function createUploadServer() {
  const express = require('express');
  const multer = require('multer');
  const app = express();
  const port = 3001;

  // Configure multer for file uploads
  const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  app.use(express.static('public'));
  app.use('/uploads', express.static('uploads'));

  // Upload endpoint
  app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      url: fileUrl,
      filename: req.file.filename 
    });
  });

  // Simple HTML form for uploads
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Restaurant Photo Upload</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
          .upload-area.dragover { border-color: #007bff; background-color: #f8f9fa; }
          input[type="file"] { margin: 10px 0; }
          button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
          .result { margin-top: 20px; padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; }
          .url { word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Restaurant Photo Upload</h1>
        <div class="upload-area" id="uploadArea">
          <p>Drag and drop your photo here, or click to select</p>
          <input type="file" id="fileInput" accept="image/*" style="display: none;">
          <button onclick="document.getElementById('fileInput').click()">Choose File</button>
        </div>
        
        <div id="result" style="display: none;">
          <h3>Upload Successful!</h3>
          <p>Copy this URL to use in your restaurant:</p>
          <div class="url" id="imageUrl"></div>
          <button onclick="copyToClipboard()">Copy URL</button>
        </div>

        <script>
          const uploadArea = document.getElementById('uploadArea');
          const fileInput = document.getElementById('fileInput');
          const result = document.getElementById('result');
          const imageUrl = document.getElementById('imageUrl');

          // Drag and drop functionality
          uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
          });

          uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
          });

          uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              uploadFile(files[0]);
            }
          });

          fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
              uploadFile(e.target.files[0]);
            }
          });

          function uploadFile(file) {
            const formData = new FormData();
            formData.append('photo', file);

            fetch('/upload', {
              method: 'POST',
              body: formData
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                imageUrl.textContent = data.url;
                result.style.display = 'block';
              } else {
                alert('Upload failed: ' + data.error);
              }
            })
            .catch(error => {
              console.error('Error:', error);
              alert('Upload failed');
            });
          }

          function copyToClipboard() {
            navigator.clipboard.writeText(imageUrl.textContent).then(() => {
              alert('URL copied to clipboard!');
            });
          }
        </script>
      </body>
      </html>
    `);
  });

  app.listen(port, () => {
    console.log(`📸 Photo upload server running at http://localhost:${port}`);
    console.log('Open this URL in your browser to upload photos from your phone');
  });
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'server') {
    createUploadServer();
  } else if (args.length >= 2) {
    const filePath = args[0];
    const restaurantName = args[1];
    uploadRestaurantPhoto(filePath, restaurantName);
  } else {
    console.log('Usage:');
    console.log('  node scripts/upload-restaurant-photo.js <image-path> <restaurant-name>');
    console.log('  node scripts/upload-restaurant-photo.js server  (to start upload server)');
  }
}

module.exports = { uploadRestaurantPhoto, createUploadServer };
