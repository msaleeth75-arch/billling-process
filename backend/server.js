const express = require('express');
const cors = require('cors');
// const admin = require('firebase-admin');
// const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase initialization (Mocked for now)
// const serviceAccount = require('./firebase-service-account.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
// const db = admin.firestore();

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running', version: '1.0.0' });
});

// Mocked Product Routes
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: 'Gold Necklace', price: 45000, stock: 10 },
        { id: 2, name: 'Diamond Ring', price: 75000, stock: 5 },
        { id: 3, name: 'Silver Bracelet', price: 5000, stock: 20 },
    ];
    res.json(products);
});

// Mocked Bill Generation Route (triggers SMS)
app.post('/api/bills', (req, res) => {
    const { customerName, customerMobile, items, total, discount, grandTotal, paymentMethod } = req.body;
    
    const billNo = `NM-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    // Simulate SMS sending logic
    const smsMessage = `Net Melt\nThank you for shopping with us!\nBill No: ${billNo}\nAmount Paid: ₹${grandTotal}\nDate: ${new Date().toLocaleDateString('en-GB')}\nYour invoice: https://netmelt.in/bill/${billNo}\nThank you for choosing Net Melt!`;
    
    console.log(`[SMS API] Sending SMS to ${customerMobile}: \n${smsMessage}`);

    // In a real scenario, we'd save this to Firestore and call the SMS API
    res.status(201).json({
        success: true,
        message: 'Bill generated and SMS sent.',
        billNo,
        smsSent: true
    });
});

app.listen(PORT, () => {
    console.log(`Net Melt backend running on port ${PORT}`);
});
