// backend/test-notifications.js
require('dotenv').config();
const WhatsAppService = require('./services/whatsappService');
const EmailService = require('./services/emailService');

async function testAllNotifications() {
    console.log('🧪 Testing WhatsApp & Email Notifications...\n');
    
    const testOrder = {
        orderNumber: 'TEST001',
        totalAmount: 1550,
        customerName: 'Test Customer',
        customerPhone: '03001234567',
        customerAddress: 'Test Address, Islamabad',
        items: [
            { name: 'Buldak Hot Chicken Ramen', price: 550, quantity: 2 },
            { name: 'Korean Rice Cakes', price: 450, quantity: 1 }
        ],
        createdAt: new Date()
    };

    try {
        // Test WhatsApp
        console.log('1. Testing WhatsApp...');
        const whatsappResult = await WhatsAppService.sendMessageToSelf(testOrder);
        
        // Test Email
        console.log('2. Testing Email...');
        const emailResult = await EmailService.sendOrderNotification(testOrder);
        
        console.log('\n🎯 TEST RESULTS:');
        console.log('✅ WhatsApp:', whatsappResult ? 'SUCCESS' : 'FAILED');
        console.log('✅ Email:', emailResult ? 'SUCCESS' : 'FAILED');
        
        // Close WhatsApp browser
        await WhatsAppService.close();
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testAllNotifications();