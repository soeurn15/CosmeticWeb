const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static website files from the root directory
app.use(express.static(__dirname));

// Ensure the local JSON data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Utility to read data from local JSON files
function readDataFile(fileName) {
    const filePath = path.join(dataDir, fileName);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
}

// Utility to write data to local JSON files
function writeDataFile(fileName, data) {
    const filePath = path.join(dataDir, fileName);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);
        return false;
    }
}

// Product catalog data
const catalog = {
    bestSellers: [
        {
            id: "h1",
            name: "Liquid Precision Eyeliner",
            description: "Ultra-fine brush tip for flawless, waterproof wings that last all day.",
            price: 18.00,
            image: "./assets/eyeliner.jpg",
            rating: 5
        },
        {
            id: "h2",
            name: "Nourishing Lip Butter",
            description: "Infused with shea butter and jojoba oil for soft, hydrated, glowing lips.",
            price: 14.00,
            image: "./assets/lipBUtter.jpg",
            rating: 4.5
        },
        {
            id: "h3",
            name: "Silk Milk Cream Blush",
            description: "A lightweight, blendable liquid blush that melts into skin for a natural flush.",
            price: 22.00,
            image: "./assets/milkBlush.jpg",
            rating: 5
        },
        {
            id: "h4",
            name: "Infinite Volume Mascara",
            description: "Clump-free, dramatic volume and lift for bold, striking eyelashes.",
            price: 24.00,
            image: "./assets/mascara.jpg",
            rating: 4
        },
        {
            id: "h5",
            name: "Glow Radiance Serum",
            description: "Revitalizing botanical serum that brightens skin tone and restores elasticity.",
            price: 38.00,
            image: "./assets/serum.jpg",
            rating: 5
        },
        {
            id: "h6",
            name: "Full Coverage Concealer",
            description: "Crease-proof formula that hides dark circles and blemishes seamlessly.",
            price: 26.00,
            image: "./assets/consiler.jpg",
            rating: 4.5
        },
        {
            id: "h7",
            name: "Phka Petal Blush Palette",
            description: "A collection of soft rose and peach shades to warm your complexion.",
            price: 32.00,
            image: "./assets/blushPhka.jpg",
            rating: 5
        },
        {
            id: "h8",
            name: "Beauty of Joseon Sunscreen",
            description: "Lightweight, organic SPF 50 sun relief cream infused with rice extracts.",
            price: 19.00,
            image: "./assets/joseon.jpg",
            rating: 5
        },
        {
            id: "h9",
            name: "Hydrating Day Moisturizer",
            description: "Deeply moisturizing day cream that locks in hydration and protects skin barriers.",
            price: 28.00,
            image: "./assets/suncream.jpg",
            rating: 4.5
        }
    ],
    shopProducts: [
        {
            id: "s1",
            name: "Rom&nd Water Tint",
            price: 15.00,
            image: "./assets/rom$man.jpg",
            badge: "Sale"
        },
        {
            id: "s2",
            name: "Butter Lip Balm",
            price: 15.00,
            image: "./assets/lipBUtter.jpg",
            badge: "Hot"
        },
        {
            id: "s3",
            name: "Dior Stellar Gloss",
            price: 38.00,
            image: "./assets/LipDior.jpg",
            badge: "Luxury"
        },
        {
            id: "s4",
            name: "Peripera Lip Ink",
            price: 12.00,
            image: "./assets/ink.jpg",
            badge: "Sale"
        },
        {
            id: "s5",
            name: "Revlon ColorStay",
            price: 14.00,
            image: "./assets/LipRevlon.jpg",
            badge: "Sale"
        },
        {
            id: "s6",
            name: "YSL Rouge Volupte",
            price: 43.00,
            image: "./assets/Lysl.jpg",
            badge: "Luxury"
        },
        {
            id: "s7",
            name: "Rom&nd Zero Matte",
            price: 11.00,
            image: "./assets/Lromand.jpg",
            badge: "Sale"
        },
        {
            id: "s8",
            name: "Maybelline Vinyl Ink",
            price: 13.00,
            image: "./assets/vinyl.jpg",
            badge: "New"
        },
        {
            id: "s9",
            name: "3CE Glow Lip Color",
            price: 18.00,
            image: "./assets/ce.jpg",
            badge: "Trending"
        },
        {
            id: "s10",
            name: "Dior Lip Glow Oil",
            price: 40.00,
            image: "./assets/diroGlow.jp.jpg",
            badge: "Luxury"
        }
    ]
};

// ==========================================
// API Endpoints
// ==========================================

// 1. GET Catalog Products
app.get('/api/products', (req, res) => {
    res.json(catalog);
});

// 2. POST Newsletter Sign-Up
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: "Invalid email address." });
    }

    const subscriptions = readDataFile('subscriptions.json');
    if (subscriptions.some(sub => sub.email === email)) {
        return res.json({ success: true, message: "Email is already subscribed!" });
    }

    subscriptions.push({ email, timestamp: new Date().toISOString() });
    writeDataFile('subscriptions.json', subscriptions);

    res.json({ success: true, message: "Subscribed successfully!" });
});

// 3. POST Contact Inquiries
app.post('/api/contact', (req, res) => {
    const { name, email, phone, website, comment } = req.body;
    if (!name || !email || !phone || !comment) {
        return res.status(400).json({ success: false, message: "Please fill out all required fields." });
    }

    const messages = readDataFile('messages.json');
    const newMessage = {
        id: `msg-${Date.now()}`,
        name,
        email,
        phone,
        website: website || '',
        comment,
        timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    writeDataFile('messages.json', messages);

    res.json({ success: true, message: "Message recorded successfully." });
});

// 4. POST Checkout Orders
app.post('/api/checkout', (req, res) => {
    const { items, total } = req.body;
    if (!items || items.length === 0 || !total) {
        return res.status(400).json({ success: false, message: "Cart items and total price are required." });
    }

    const orders = readDataFile('orders.json');
    const invoiceId = `SR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
        invoiceId,
        items,
        total: parseFloat(total),
        status: "pending",
        timestamp: new Date().toISOString()
    };

    orders.push(newOrder);
    writeDataFile('orders.json', orders);

    res.json({ success: true, invoiceId, message: "Order processed successfully." });
});

// Redirect default base URL to home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Error page handling
app.use((req, res) => {
    res.status(404).send('<h1>404 — Page Not Found</h1><p>The cosmetic product or page you are looking for does not exist.</p><a href="/home.html">Back to Home</a>');
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`SaRa Cosmetic server is running on:`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`========================================\n`);
});
