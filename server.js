const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Product Schema & Model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    features: [String]
});

const Product = mongoose.model('Product', productSchema);

// 2. MongoDB Atlas Connection String (with your username & password)
const MONGO_URI = 'mongodb+srv://uswaimtiaz66_db_user:08HSqySFNTYrIJeG@cluster0.4stawbe.mongodb.net/ecomStore?retryWrites=true&w=majority';

// 3. Start Server & Connect to Atlas Cloud
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas Cloud Successfully!');

        // Check if DB is empty, then seed default products
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany([
                { 
                    name: "Wireless Noise-Canceling Headphones", 
                    price: 149.99, 
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", 
                    description: "Premium over-ear wireless headphones featuring active noise cancellation, 30-hour battery life, and crystal-clear sound quality for immersive listening." 
                },
                { 
                    name: "Smart Fitness Watch Series V", 
                    price: 199.50, 
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", 
                    description: "Advanced smartwatch with real-time heart rate monitoring, sleep tracking, GPS navigation, and waterproof design up to 50 meters." 
                },
                { 
                    name: "Ultra HD 4K Action Camera", 
                    price: 129.00, 
                    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500", 
                    description: "Compact 4K action camera with wide-angle lens, WiFi connectivity, and rugged waterproof casing perfect for sports and outdoor adventures." 
                },
                { 
                    name: "Portable Bluetooth Speaker Pro", 
                    price: 79.99, 
                    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500", 
                    description: "High-power portable speaker delivering 360-degree stereo audio with deep bass, RGB lighting, and 12 hours of continuous playback." 
                },
                { 
                    name: "Ergonomic Mechanical Gaming Keyboard", 
                    price: 89.95, 
                    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", 
                    description: "Customizable mechanical keyboard with tactile RGB switches, durable aluminum top plate, and anti-ghosting technology for high productivity." 
                }
            ]);
            console.log('📦 Electronics catalog seeded to Atlas Cloud!');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {
        console.log('❌ DB Connection Error:', err.message);
    }
}

// 4. API Endpoints
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});

// Single Product Details Endpoint
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});

startServer();
module.exports = app;