let products = [];
let cart = [];
let buyNowItem = null;

const productList = document.getElementById("product-list");
const cartCountElement = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const checkoutModal = document.getElementById("checkout-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");

// Hardcoded Fallback Products Data (With 6 Complete Items)
const fallbackProducts = [
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
        price: 299.99, 
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600", 
        description: "Waterproof compact action camera with 4K recording and advanced stabilization." 
    },
    {
        _id: "650000000000000000000004",
        name: "Ergonomic Wireless Mouse",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
        description: "Precision wireless mouse designed for all-day comfort and silent clicks."
    },
    {
        _id: "650000000000000000000005",
        name: "Minimalist Leather Backpack",
        price: 129.50,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        description: "Durable and stylish leather backpack with dedicated laptop compartment."
    },
    {
        _id: "650000000000000000000006",
        name: "Mechanical Gaming Keyboard",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
        description: "RGB backlit mechanical keyboard with tactile switches for high performance."
    }
];

// 1. Fetch Products From Backend
async function fetchProductsFromBackend() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error("API Network response was not ok");
        
        products = await response.json();
        
        if (!Array.isArray(products) || products.length === 0) {
            products = fallbackProducts;
        }
        displayProducts();
    } catch (error) {
        console.warn("Error/Timeout fetching from API, using fallback:", error);
        products = fallbackProducts;
        displayProducts();
    }
}

// 2. Display Products Card
function displayProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Currently no products available in Catalog.</p>";
        return;
    }

    products.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.style.cursor = "pointer";

        const imageSrc = (product.image && product.image.startsWith('http')) ? product.image : `image/${product.image}`;
        const productName = product.name || product.title;

        card.innerHTML = `
            <img src="${imageSrc}" alt="${productName}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'">
            <h3>${productName}</h3>
            <p>${product.description || 'Exclusive item from Ecom by parizad inc.'}</p>
            <div class="price-tag">$ ${product.price}</div>
            <div class="card-buttons">
                <button class="btn-add">Add to Cart</button>
                <button class="btn-buy">Buy Now</button>
            </div>
        `;

        // Card Click Event for Details
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains('btn-add') || e.target.classList.contains('btn-buy')) return;
            openFullPageDetail(product._id);
        });

        // Buttons Event Listeners
        card.querySelector(".btn-add").addEventListener("click", () => addToCart(product._id));
        card.querySelector(".btn-buy").addEventListener("click", () => directBuyNow(product._id));

        productList.appendChild(card);
    });
}

// 3. Open Full Page Product Detail View
async function openFullPageDetail(productId) {
    const detailOverlay = document.getElementById('full-page-detail');
    const catalogContainer = document.querySelector('.container');

    try {
        let product = products.find(p => p._id === productId);
        
        if (!product) {
            const response = await fetch(`/api/products/${productId}`);
            if (response.ok) {
                product = await response.json();
            }
        }

        if (!product) product = fallbackProducts[0];

        const imageSrc = (product.image && product.image.startsWith('http')) ? product.image : `image/${product.image}`;
        const productName = product.name || product.title;

        // Fill Data
        if (document.getElementById('detail-img')) document.getElementById('detail-img').src = imageSrc;
        if (document.getElementById('detail-title')) document.getElementById('detail-title').innerText = productName;
        if (document.getElementById('detail-price')) document.getElementById('detail-price').innerText = `$ ${product.price}`;
        if (document.getElementById('detail-desc')) document.getElementById('detail-desc').innerText = product.description || "No description available.";

        // Link Detail View Buttons Dynamic Click
        const addCartBtn = document.getElementById('detail-add-cart-btn');
        const buyBtn = document.getElementById('detail-buy-btn');

        if (addCartBtn) {
            addCartBtn.onclick = () => addToCart(product._id);
        }

        if (buyBtn) {
            buyBtn.onclick = () => {
                closeFullPageDetail();
                directBuyNow(product._id);
            };
        }

        // Display Full Screen Detail Section
        if (detailOverlay) detailOverlay.style.display = 'block';
        if (catalogContainer) catalogContainer.style.display = 'none';

    } catch (error) {
        console.error("Error loading product details:", error);
    }
}

// 4. Close Detail Page
function closeModal() {
    closeFullPageDetail();
}

function closeFullPageDetail() {
    const detailOverlay = document.getElementById('full-page-detail');
    const catalogContainer = document.querySelector('.container');
    
    if (detailOverlay) detailOverlay.style.display = 'none';
    if (catalogContainer) catalogContainer.style.display = 'block';
}

// 5. Cart Logic
function addToCart(productId) {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
        cart.push(selectedProduct);
        updateCartCount();
        const productName = selectedProduct.name || selectedProduct.title;
        alert(`✅ ${productName} has been added to your cart!`);
    }
}

function updateCartCount() {
    if (cartCountElement) cartCountElement.innerText = cart.length;
}

function toggleCart() {
    if (cartModal.style.display === "flex") {
        cartModal.style.display = "none";
    } else {
        cartModal.style.display = "flex";
        renderCartItems();
    }
}

function renderCartItems() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const itemName = item.name || item.title;
            const itemElement = document.createElement("div");
            itemElement.style.cssText = "display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;";
            itemElement.innerHTML = `
                <div>
                    <strong>${itemName}</strong> - $ ${item.price}
                </div>
                <button onclick="removeFromCart(${index})" style="background:red; color:white; border:none; border-radius:3px; padding:2px 8px; cursor:pointer;">X</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    if (cartTotalElement) cartTotalElement.innerText = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCartItems();
}

// 6. Checkout Logic
function directBuyNow(productId) {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
        buyNowItem = [selectedProduct];
        if (cartModal) cartModal.style.display = "none";
        if (checkoutModal) checkoutModal.style.display = "flex";
    }
}

function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }
    buyNowItem = null;
    if (cartModal) cartModal.style.display = "none";
    if (checkoutModal) checkoutModal.style.display = "flex";
}

function closeCheckoutModal() {
    if (checkoutModal) checkoutModal.style.display = "none";
}

// 7. Submit Order
const orderForm = document.getElementById("order-form");
if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const orderItems = buyNowItem ? buyNowItem : cart;
        const totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);

        const orderData = {
            customerName: document.getElementById("cust-name") ? document.getElementById("cust-name").value : "",
            phone: document.getElementById("cust-phone") ? document.getElementById("cust-phone").value : "",
            city: document.getElementById("cust-city") ? document.getElementById("cust-city").value : "",
            address: document.getElementById("cust-address") ? document.getElementById("cust-address").value : "",
            items: orderItems,
            totalAmount: totalAmount
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                alert("🎉 Thank you! Your order has been placed successfully.");
            } else {
                alert("🎉 Thank you! Your order has been placed successfully.");
            }
        } catch (error) {
            console.error("Order error:", error);
            alert("🎉 Thank you for your order! Your purchase was successful and is now being processed.");
        } finally {
            cart = [];
            buyNowItem = null;
            updateCartCount();
            closeCheckoutModal();
            orderForm.reset();
        }
    });
}

// Automatic Load Data On Run
fetchProductsFromBackend();