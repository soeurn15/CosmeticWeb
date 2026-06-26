// ==========================================
// 1. Mobile Menu Navigation Toggle
// ==========================================
const mobileToggle = document.querySelector('.mobile-toggle');
const siteNav = document.getElementById('site-nav');

if (mobileToggle && siteNav) {
    mobileToggle.addEventListener('click', () => {
        siteNav.classList.toggle('active');
        const expanded = mobileToggle.getAttribute('aria-expanded') === 'true' || false;
        mobileToggle.setAttribute('aria-expanded', !expanded);
    });
}

// Close mobile menu when a link is clicked
const navLinks = document.querySelectorAll('.site-nav ul li a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (siteNav && siteNav.classList.contains('active')) {
            siteNav.classList.remove('active');
            if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

// ==========================================
// 2. Carousel Slideshow (home.html only)
// ==========================================
let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const carouselSlide = document.querySelector('.carousel-slide');

function showSlide(index) {
    if (!carouselSlide || slides.length === 0) return;
    
    const totalSlides = slides.length;
    if (index < 0) {
        currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }

    const offset = currentIndex * -100;
    carouselSlide.style.transform = `translateX(${offset}%)`;
}

function moveSlide(step) {
    showSlide(currentIndex + step);
}

// Initialize Carousel & Auto-slide
if (carouselSlide && slides.length > 0) {
    showSlide(currentIndex);
    setInterval(() => {
        moveSlide(1);
    }, 5000);
}

// ==========================================
// 3. Read More Details (about.html only)
// ==========================================
const readMoreButtons = document.getElementsByClassName("readMoreBtn");
const moreDetailsDivs = document.getElementsByClassName("more-details");

if (readMoreButtons.length > 0) {
    Array.from(readMoreButtons).forEach((button, index) => {
        button.addEventListener("click", function () {
            const moreDetails = moreDetailsDivs[index];
            if (moreDetails) {
                if (moreDetails.style.display === "none" || moreDetails.style.display === "") {
                    moreDetails.style.display = "block";
                    this.textContent = "READ LESS";
                } else {
                    moreDetails.style.display = "none";
                    this.textContent = "READ MORE";
                }
            }
        });
    });
}

// ==========================================
// 4. Shopping Cart Drawer Logic
// ==========================================
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartCloseBtn = document.getElementById('cart-close');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartCountEl = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// Open / Close Drawer Actions
function openCart() {
    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
    }
}

function closeCart() {
    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
    }
}

if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });
}

if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Retrieve and Store Cart in LocalStorage
function getCart() {
    const cart = localStorage.getItem('sara_cosmetic_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('sara_cosmetic_cart', JSON.stringify(cart));
    updateCartUI();
}

// Update Cart Badge Count, Item List and Subtotal
function updateCartUI() {
    const cart = getCart();
    
    // Update count badge
    let totalItems = 0;
    cart.forEach(item => totalItems += item.qty);
    if (cartCountEl) cartCountEl.textContent = totalItems;

    if (!cartItemsContainer || !cartSubtotalEl) return;

    // Render Cart Items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
        cartSubtotalEl.textContent = '$0.00';
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <div class="qty-control">
                            <button class="qty-btn dec-qty" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn inc-qty" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// Add Item to Cart
function addToCart(id, name, price, image) {
    let cart = getCart();
    const parsedPrice = parseFloat(price);
    const existingIndex = cart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parsedPrice,
            image: image,
            qty: 1
        });
    }

    saveCart(cart);
    openCart(); // Show drawer immediately after adding
}

// Bind Listeners for Add to Cart Buttons
document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
        const id = addBtn.getAttribute('data-id');
        const name = addBtn.getAttribute('data-name');
        const price = addBtn.getAttribute('data-price');
        const image = addBtn.getAttribute('data-image');
        
        if (id && name && price && image) {
            addToCart(id, name, price, image);
        }
    }
});

// Event Delegation for Qty Actions and Remove Item Inside Cart
if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
        let cart = getCart();
        const id = e.target.getAttribute('data-id');
        if (!id) return;

        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex === -1) return;

        if (e.target.classList.contains('inc-qty')) {
            cart[itemIndex].qty += 1;
            saveCart(cart);
        } else if (e.target.classList.contains('dec-qty')) {
            if (cart[itemIndex].qty > 1) {
                cart[itemIndex].qty -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
            saveCart(cart);
        } else if (e.target.classList.contains('remove-btn')) {
            cart.splice(itemIndex, 1);
            saveCart(cart);
        }
    });
}

// Checkout Button Click Action (POST to Backend API)
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items to checkout.');
            return;
        }

        // Calculate total
        let total = 0;
        cart.forEach(item => total += item.price * item.qty);

        // POST order data to server
        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                total: total
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Thank you for shopping with SaRa Cosmetic!\n\nOrder Invoice: ${data.invoiceId}\n\nYour luxurious package has been logged for dispatch.`);
                localStorage.removeItem('sara_cosmetic_cart');
                updateCartUI();
                closeCart();
            } else {
                alert(`Checkout failed: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error processing checkout:', error);
            alert('Failed to connect to checkout service. Please try again.');
        });
    });
}

// ==========================================
// 5. Load Catalog Products Dynamically (REST API)
// ==========================================
function loadCatalog() {
    const bestSellersContainer = document.getElementById('best-sellers-container');
    const shopProductsContainer = document.getElementById('shop-products-container');

    if (!bestSellersContainer && !shopProductsContainer) return;

    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            // Render Best Sellers (home.html)
            if (bestSellersContainer && data.bestSellers) {
                renderBestSellers(data.bestSellers, bestSellersContainer);
            }

            // Render Shop Products (services.html)
            if (shopProductsContainer && data.shopProducts) {
                renderShopProducts(data.shopProducts, shopProductsContainer);
            }
        })
        .catch(error => {
            console.error('Error fetching product catalog:', error);
            if (bestSellersContainer) {
                bestSellersContainer.innerHTML = '<div class="cart-empty" style="grid-column: 1 / -1; color: #d11a2a;">Failed to load best sellers. Please verify the server is running.</div>';
            }
            if (shopProductsContainer) {
                shopProductsContainer.innerHTML = '<div class="cart-empty" style="grid-column: 1 / -1; color: #d11a2a;">Failed to load catalog. Please verify the server is running.</div>';
            }
        });
}

function renderBestSellers(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div class="cart-empty" style="grid-column: 1 / -1;">No products found.</div>';
        return;
    }

    let html = '';
    products.forEach(p => {
        // Calculate stars
        let starsHtml = '';
        const fullStars = Math.floor(p.rating);
        const hasHalf = p.rating % 1 !== 0;
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalf) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }

        html += `
            <div class="card">
                <img src="${p.image}" alt="${p.name}" class="card-img">
                <div class="card-content">
                    <div class="star-rating">
                        ${starsHtml}
                    </div>
                    <h2 class="card-title">${p.name}</h2>
                    <p class="card-description">${p.description}</p>
                    <p class="card-price">$${p.price.toFixed(2)}</p>
                    <button class="card-btn add-to-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}">Add To Cart</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderShopProducts(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div class="cart-empty" style="grid-column: 1 / -1;">No products found.</div>';
        return;
    }

    let html = '';
    products.forEach(p => {
        html += `
            <div class="product-card">
                <div class="sale-badge">${p.badge}</div>
                <img src="${p.image}" alt="${p.name}">
                <div class="product-name">${p.name}</div>
                <div class="product-price">$${p.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}">
                    ADD TO CART <i class="fa-solid fa-cart-shopping"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==========================================
// 6. Form Submissions (POST to Backend API)
// ==========================================

// Newsletter Sign-up Form
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const formMessage = newsletterForm.querySelector('.form-message');

        if (emailInput && emailInput.value.trim() !== '') {
            const email = emailInput.value.trim();

            fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => response.json())
            .then(data => {
                if (formMessage) {
                    formMessage.style.color = '#c5a880';
                    formMessage.textContent = data.message;
                }
                emailInput.value = '';
            })
            .catch(error => {
                console.error('Newsletter error:', error);
                if (formMessage) {
                    formMessage.style.color = '#d11a2a';
                    formMessage.textContent = 'Connection failed. Please try again.';
                }
            });
        }
    });
}

// Contact Inquiry Form
const contactForm = document.getElementById('contact-inquiry-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const website = document.getElementById('website').value.trim();
        const comment = document.getElementById('comment').value.trim();

        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, website, comment })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Thank you for contacting SaRa Cosmetic Customer Care!\n\nWe have received your message and will respond to you within 24 hours.');
                contactForm.reset();
            } else {
                alert(`Submission failed: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Contact form error:', error);
            alert('Failed to connect to inquiry service. Please try again.');
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    loadCatalog();
});