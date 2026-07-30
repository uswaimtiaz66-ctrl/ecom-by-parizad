const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Public static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // Direct root access for logo

// Product Schema & Model
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    features: [String]
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://uswaimtiaz66_db_user:08HSqySFNTYrIJeG@cluster0.4stawbe.mongodb.net/ecomStore?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(() => console.log("ℹ️ Running with Store Backup Data."));

// Fallback Data
const defaultProducts = [
    { 
        _id: "650000000000000000000001",
        name: "Wireless Noise-Canceling Headphones", 
        price: 149.99, 
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", 
        description: "Premium over-ear wireless headphones featuring active noise cancellation." 
    },
    { 
        _id: "650000000000000000000002",
        name: "Smart Fitness Watch Series V", 
        price: 199.50, 
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", 
        description: "Advanced smartwatch with real-time heart rate monitoring." 
    },
    { 
        _id: "650000000000000000000003",
        name: "Ultra HD 4K Action Camera", 
        price: 129.00, 
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500", 
        description: "Compact 4K action camera with wide-angle lens." 
    }
];

// Routes
app.get('/api/products', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const products = await Product.find();
            if (products.length > 0) return res.json(products);
        }
    } catch (e) {}
    res.json(defaultProducts);
});

app.get('/api/products/:id', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const product = await Product.findById(req.params.id);
            if (product) return res.json(product);
        }
    } catch (e) {}
    const item = defaultProducts.find(p => p._id === req.params.id) || defaultProducts[0];
    res.json(item);
});

app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;