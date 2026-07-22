document.addEventListener('DOMContentLoaded', () => {
    // State
    let products = [
        { id: 1, name: 'White Chocolate Almonds' },
        { id: 2, name: 'Dark Chocolate Almonds' },
        { id: 3, name: 'Milk Chocolate Almonds' },
        { id: 4, name: 'White Chocolate Cashews' },
        { id: 5, name: 'Dark Chocolate Cashews' },
        { id: 6, name: 'Milk Chocolate Cashews' },
        { id: 7, name: 'White Chocolate Hazelnuts' },
        { id: 8, name: 'Dark Chocolate Hazelnuts' },
        { id: 9, name: 'Mixed Chocolate Nuts' },
        { id: 10, name: 'Premium Gift Box' },
    ];
    let currentBillItems = [];
    let billCounter = 1;
    let lastBillData = null;

    // Elements
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const loginForm = document.getElementById('login-form');
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('current-page-title');
    
    const productSelect = document.getElementById('product-select');
    const productPrice = document.getElementById('product-price');
    const productQuantity = document.getElementById('product-quantity');
    const addBtn = document.getElementById('add-to-bill-btn');
    const billItemsTable = document.getElementById('bill-items');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const grandTotalEl = document.getElementById('grand-total');
    const generateBillBtn = document.getElementById('generate-bill-btn');
    const generateWhatsappBtn = document.getElementById('generate-whatsapp-btn');
    const billNoEl = document.getElementById('bill-no');

    const invoiceModal = document.getElementById('invoice-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const printBtn = document.getElementById('print-invoice-btn');
    const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');

    // Setup Products dropdown
    function populateProducts() {
        productSelect.innerHTML = '<option value="" disabled selected>Select Product</option>';
        products.forEach(p => {
            productSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
    }
    populateProducts();

    // Login Logic (Mocked)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Skip actual auth for now
        loginScreen.classList.remove('active');
        appScreen.classList.add('active');
    });

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update view
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            // Update title
            pageTitle.textContent = item.textContent.trim().substring(2).trim(); // Remove icon
        });
    });

    // Billing Logic
    function updateTotals() {
        let sub = 0;
        currentBillItems.forEach(item => sub += item.total);
        const discount = parseFloat(discountEl.value) || 0;
        const grand = sub - discount;

        subtotalEl.textContent = `₹${sub}`;
        grandTotalEl.textContent = `₹${Math.max(0, grand)}`;
    }

    function renderBillItems() {
        billItemsTable.innerHTML = '';
        currentBillItems.forEach((item, index) => {
            billItemsTable.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.total}</td>
                </tr>
            `;
        });
        updateTotals();
    }

    addBtn.addEventListener('click', () => {
        const prodId = parseInt(productSelect.value);
        const qty = parseInt(productQuantity.value);
        const price = parseFloat(productPrice.value);
        
        if (!prodId || qty < 1 || isNaN(price) || price < 0) {
            alert('Please select a product and enter a valid price and quantity.');
            return;
        }

        const product = products.find(p => p.id === prodId);
        const existingItem = currentBillItems.find(i => i.id === prodId && i.price === price);

        if (existingItem) {
            existingItem.qty += qty;
            existingItem.total = existingItem.qty * existingItem.price;
        } else {
            currentBillItems.push({
                id: product.id,
                name: product.name,
                price: price,
                qty: qty,
                total: price * qty
            });
        }
        
        productQuantity.value = 1;
        productPrice.value = '';
        productSelect.value = '';
        renderBillItems();
    });

    discountEl.addEventListener('input', updateTotals);

    // WhatsApp Integration
    function openWhatsApp(custName, custMobile, billNumber, date, items, grandTotal) {
        let productList = items.map(i => `- ${i.qty}x ${i.name} (₹${i.price}) = ₹${i.total}`).join('\n');
        
        // Provide a mock PDF link or just text (since we generate PDF on client side)
        const pdfLink = `https://netmelt.in/invoice/${billNumber}.pdf`;

        const message = `🍫 NET MELT

Hello ${custName},

Thank you for choosing Net Melt.

Invoice Details:
🧾 Bill No: ${billNumber}
📅 Date: ${date}
🛍️ Products:
${productList}

💰 Total Amount: ₹${grandTotal}

Download Invoice: ${pdfLink}

Thank you for your purchase.
We look forward to serving you again!

Regards,
Net Melt`;

        const encodedMessage = encodeURIComponent(message);
        
        let phone = custMobile.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            window.open(`whatsapp://send?phone=${phone}&text=${encodedMessage}`, '_blank');
        } else {
            window.open(`https://web.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`, '_blank');
        }
    }

    // Generate Bill
    function processBill(sendWhatsAppFlag = false) {
        if (currentBillItems.length === 0) {
            alert('Add items to bill first');
            return;
        }

        const custName = document.getElementById('customer-name').value;
        const custMobile = document.getElementById('customer-mobile').value;
        
        if (!custName || !custMobile) {
            alert('Please enter customer details');
            return;
        }

        const paymentMode = document.querySelector('input[name="payment"]:checked').value;
        const sub = currentBillItems.reduce((acc, item) => acc + item.total, 0);
        const discount = parseFloat(discountEl.value) || 0;
        const grand = Math.max(0, sub - discount);
        const billNumber = `NM-${String(billCounter).padStart(6, '0')}`;
        const date = new Date().toLocaleDateString('en-GB');

        // Populate Invoice
        document.getElementById('inv-bill-no').textContent = billNumber;
        document.getElementById('inv-date').textContent = date;
        document.getElementById('inv-customer-name').textContent = custName;
        document.getElementById('inv-customer-mobile').textContent = custMobile;
        
        const invItems = document.getElementById('inv-items');
        invItems.innerHTML = '';
        currentBillItems.forEach(item => {
            invItems.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.total}</td>
                </tr>
            `;
        });

        document.getElementById('inv-subtotal').textContent = `₹${sub}`;
        document.getElementById('inv-discount').textContent = `₹${discount}`;
        document.getElementById('inv-grand-total').textContent = `₹${grand}`;
        document.getElementById('inv-payment-mode').textContent = paymentMode;

        // Save for modal send functionality
        lastBillData = {
            custName, custMobile, billNumber, date, items: [...currentBillItems], grand
        };

        // Show Invoice
        invoiceModal.classList.add('active');

        if (sendWhatsAppFlag) {
            openWhatsApp(custName, custMobile, billNumber, date, currentBillItems, grand);
        }

        // Reset
        billCounter++;
        billNoEl.textContent = `NM-${String(billCounter).padStart(6, '0')}`;
        currentBillItems = [];
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-mobile').value = '';
        discountEl.value = '0';
        renderBillItems();
    }

    generateBillBtn.addEventListener('click', () => processBill(false));
    generateWhatsappBtn.addEventListener('click', () => processBill(true));
    
    sendWhatsappBtn.addEventListener('click', () => {
        if (lastBillData) {
            openWhatsApp(lastBillData.custName, lastBillData.custMobile, lastBillData.billNumber, lastBillData.date, lastBillData.items, lastBillData.grand);
        }
    });

    // Modal actions
    closeModalBtn.addEventListener('click', () => invoiceModal.classList.remove('active'));

    printBtn.addEventListener('click', () => {
        window.print();
    });

    downloadPdfBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-print-area');
        const opt = {
            margin:       0.5,
            filename:     'Invoice.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        // Exclude buttons from PDF
        document.querySelector('.modal-actions').style.display = 'none';
        html2pdf().set(opt).from(element).save().then(() => {
            document.querySelector('.modal-actions').style.display = 'flex';
        });
    });

});
