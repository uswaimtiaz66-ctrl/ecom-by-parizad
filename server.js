const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Public folder ki static files (index.html, style.css, script.js) serve karein
app.use(express.static(path.join(__dirname, 'public')));

// Product Schema & Model setup
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    features: [String]
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// MongoDB Atlas Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://uswaimtiaz66_db_user:08HSqySFNTYrIJeG@cluster0.4stawbe.mongodb.net/ecomStore?retryWrites=true&w=majority';

// Database connection status helper function
let isConnected = false;
async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) return;
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}

// 1. All Products API
app.get('/api/products', async (req, res) => {
    try {
        await connectDB();
        
        // Agar database khali ho toh sample products add karein
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany([
                { 
                    name: "Wireless Noise-Canceling Headphones", 
                    price: 149.99, 
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", 
                    description: "Premium over-ear wireless headphones featuring active noise cancellation, 30-hour battery life, and crystal-clear sound quality." 
                },
                { 
                    name: "Smart Fitness Watch Series V", 
                    price: 199.50, 
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", 
                    description: "Advanced smartwatch with real-time heart rate monitoring, sleep tracking, GPS navigation, and waterproof design." 
                },
                { 
                    name: "Ultra HD 4K Action Camera", 
                    price: 129.00, 
                    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500", 
                    description: "Compact 4K action camera with wide-angle lens, WiFi connectivity, and rugged waterproof casing." 
                },
                { 
                    name: "Portable Bluetooth Speaker Pro", 
                    price: 79.99, 
                    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500", 
                    description: "High-power portable speaker delivering 360-degree stereo audio with deep bass and RGB lighting." 
                },
                { 
                    name: "Ergonomic Mechanical Gaming Keyboard", 
                    price: 89.95, 
                    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", 
                    description: "Customizable mechanical keyboard with tactile RGB switches and durable aluminum top plate." 
                }
            ]);
        }

        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});

// 2. Single Product Details API
app.get('/api/products/:id', async (req, res) => {
    try {
        await connectDB();
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});

// Front-end UI load karne ke liye Root & Wildcard route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Module Export for Vercel
module.exports = app;