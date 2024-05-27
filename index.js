const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require('fs'); 
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require("cloudinary").v2;
const cors = require('cors');

app.use(cors());


require("dotenv").config();
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Configure Multer to handle multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads');
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);


//connecting to database
require('./db/db');

// creating schema 
const productSchema = new mongoose.Schema({
    title: { type: String, maxlength: 50 },
    description: { type: String, maxlength: 200 },
    thumbnailUrl: String,
    videoUrl: String
});
  
const Product = mongoose.model('Product', productSchema);

// POST API endpoint to create a new product
app.post('/products', upload,
async (req, res) => {
    try {
        const { title, description } = req.body;
        const thumbnailPath = req.files.thumbnail ? req.files.thumbnail[0].path : null;
        const videoPath = req.files.video ? req.files.video[0].path : null;

        // Your validation logic here

        // Uploading to Cloudinary
        let thumbnailUrl = null;
        let videoUrl = null;

        if (thumbnailPath) {
            const thumbnailUploadResult = await cloudinary.uploader.upload(thumbnailPath);
            thumbnailUrl = thumbnailUploadResult.secure_url;
        }

        if (videoPath) {
            const videoUploadResult = await cloudinary.uploader.upload(videoPath, { resource_type: 'video' });
            videoUrl = videoUploadResult.secure_url;
        }

        const product = new Product({
            title,
            description,
            thumbnailUrl,
            videoUrl
        });

        await product.save();

        // Delete local files after saving the product
        if (thumbnailPath) {
            fs.unlink(thumbnailPath, (err) => {
                if (err) console.log(err);
                else console.log("\nDeleted thumbnail file");
            });
        }

        if (videoPath) {
            fs.unlink(videoPath, (err) => {
                if (err) console.log(err);
                else console.log("\nDeleted video file");
            });
        }

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Error creating product' });
    }
});

// GET API endpoint to fetch all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

let port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("server is running on", port);
});
