const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Static files (public folder) serve karein
app.use(express.static(path.join(__dirname, 'public')));

// 2. Product Schema & Model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    features: [String]
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// 3. MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://uswaimtiaz66_db_user:08HSqySFNTYrIJeG@cluster0.4stawbe.mongodb.net/ecomStore?retryWrites=true&w=majority';

// Serverless friendly DB connection helper
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(MONGO_URI);
}

// 4. Root Route (Website Home Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 5. API Endpoints
app.get('/api/products', async (req, res) => {
    try {
        await connectDB();
        
        // Seed default products if DB is empty
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

// Local development server listener
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on port ${PORT}`);
    });
}

// Export for Vercel Serverless Function
module.exports = app;