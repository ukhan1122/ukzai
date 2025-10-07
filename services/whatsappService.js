// backend/services/whatsappService.js
const puppeteer = require('puppeteer');
const qrcode = require('qrcode-terminal');
const path = require('path');

class WhatsAppService {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isConnected = false;
        this.userDataDir = path.join(__dirname, 'whatsapp_session');
    }

    async initialize() {
        try {
            console.log('🚀 Starting WhatsApp Web...');
            
            this.browser = await puppeteer.launch({
                headless: false,
                userDataDir: this.userDataDir,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            });

            this.page = await this.browser.newPage();
            
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            console.log('📱 Opening WhatsApp Web...');
            await this.page.goto('https://web.whatsapp.com', { 
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Check if already logged in
            try {
                await this.page.waitForSelector('._3OrV6', { timeout: 10000 });
                console.log('✅ Already logged in to WhatsApp!');
                this.isConnected = true;
                return;
            } catch (e) {
                console.log('🔐 Need to scan QR code...');
            }

            // Wait for QR code
            console.log('⏳ Waiting for QR code...');
            await this.page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 30000 });
            
            // Get and display QR code
            const qrCodeData = await this.page.evaluate(() => {
                const canvas = document.querySelector('canvas[aria-label="Scan me!"]');
                return canvas ? canvas.toDataURL() : null;
            });

            if (qrCodeData) {
                console.log('\n📱 SCAN THIS QR CODE WITH YOUR WHATSAPP:');
                console.log('1. Open WhatsApp on your phone');
                console.log('2. Tap Menu → WhatsApp Web');
                console.log('3. Scan this QR code:\n');
                qrcode.generate(qrCodeData, { small: true });
            }

            // Wait for connection
            console.log('⏳ Waiting for you to scan QR code...');
            await this.page.waitForSelector('._3OrV6', { timeout: 120000 });
            
            this.isConnected = true;
            console.log('✅ WhatsApp Web connected successfully!');
            
        } catch (error) {
            console.error('❌ WhatsApp initialization failed:', error.message);
        }
    }

    async sendOrderNotification(order) {
        if (!this.isConnected) {
            console.log('🔄 Connecting to WhatsApp...');
            await this.initialize();
        }

        try {
            const message = this.formatOrderMessage(order);
            const yourNumber = '923407939853'; // YOUR WHATSAPP NUMBER
            
            console.log('💬 Preparing to send WhatsApp message...');
            
            const formattedNumber = yourNumber.replace('+', '');
            
            await this.page.goto(`https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            console.log('⏳ Waiting for send button...');
            await this.page.waitForSelector('button[data-tab="11"]', { timeout: 15000 });
            
            await this.page.waitForTimeout(3000);
            
            await this.page.click('button[data-tab="11"]');
            console.log('✅ Send button clicked!');
            
            await this.page.waitForTimeout(5000);
            
            console.log('🎉 WhatsApp message sent successfully!');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to send WhatsApp message:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    formatOrderMessage(order) {
        // Extract customer info from shippingAddress
        const customerName = order.shippingAddress?.name || 'N/A';
        const customerPhone = order.shippingAddress?.phone || 'N/A';
        const customerAddress = order.shippingAddress?.address || 'N/A';
        
        const itemsText = order.items.map(item => 
            `• ${item.name} - Rs. ${item.price} x ${item.quantity}`
        ).join('\n');

        return `🛒 *NEW ORDER - UKZai.shop* 🛒

📦 *Order ID:* ${order._id.toString().slice(-6).toUpperCase()}
💰 *Amount:* Rs. ${order.totalPrice}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
🏠 *Address:* ${customerAddress}
🕒 *Time:* ${new Date(order.createdAt).toLocaleString()}

${itemsText}

_Order received at ${new Date().toLocaleTimeString()}_

🔗 View: ukzai.shop/admin`;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

const whatsappService = new WhatsAppService();
module.exports = whatsappService;