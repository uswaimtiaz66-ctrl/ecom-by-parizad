let products = [];
let cart = [];
let buyNowItem = null;

const productList = document.getElementById("product-list");
const cartCountElement = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const checkoutModal = document.getElementById("checkout-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");

// 1. Fetch Products From Backend
async function fetchProductsFromBackend() {
    const productList = document.getElementById('product-list');
    try {
        const response = await fetch('http://localhost:5000/api/products');
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
        if (productList) {
            productList.innerHTML = "<p style='text-align: center; color: red;'>Failed to load products from server.</p>";
        }
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

        const imageSrc = product.image.startsWith('http') ? product.image : `image/${product.image}`;

        card.innerHTML = `
            <img src="${imageSrc}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250?text=Ecom+Parizad'">
            <h3>${product.name}</h3>
            <p>${product.description || 'Exclusive item from Ecom by parizad inc.'}</p>
            <div class="price-tag">$ ${product.price}</div>
            <div class="card-buttons">
                <button class="btn-add">Add to Cart</button>
                <button class="btn-buy">Buy Now</button>
            </div>
        `;

        // Card Par Click Se Full Detail Khulegi
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
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        const product = await response.json();

        const imageSrc = product.image.startsWith('http') ? product.image : `image/${product.image}`;

        // Fill Data
        if (document.getElementById('detail-img')) document.getElementById('detail-img').src = imageSrc;
        if (document.getElementById('detail-title')) document.getElementById('detail-title').innerText = product.name;
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
        alert(`✅ ${selectedProduct.name} cart mein add ho gaya!`);
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
            const itemElement = document.createElement("div");
            itemElement.style.cssText = "display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;";
            itemElement.innerHTML = `
                <div>
                    <strong>${item.name}</strong> - $ ${item.price}
                </div>
                <button onclick="removeFromCart(${index})" style="background:red; color:white; border:none; border-radius:3px; padding:2px 8px; cursor:pointer;">X</button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    if (cartTotalElement) cartTotalElement.innerText = total;
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
        alert("Aapka cart khaali hai!");
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
            customerName: document.getElementById("cust-name").value,
            phone: document.getElementById("cust-phone").value,
            city: document.getElementById("cust-city").value,
            address: document.getElementById("cust-address").value,
            items: orderItems,
            totalAmount: totalAmount
        };

        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                alert("🎉 Shukriya! Aapka Order Successfully Place Ho Gaya Hai.");
                cart = [];
                buyNowItem = null;
                updateCartCount();
                closeCheckoutModal();
                orderForm.reset();
            } else {
                alert("❌ Order place nahi ho saka. Dubara koshish karein.");
            }
        } catch (error) {
            console.error("Order error:", error);
            alert("Server Error! Check karein backend chal raha hai.");
        }
    });
}

// Automatic Load Data On Run
fetchProductsFromBackend();