// backend/services/whatsappService.js - EXACT CODE
const axios = require('axios');

class WhatsAppService {
    async sendOrderNotification(order) {
        try {
            console.log('📱 Sending Telegram notification...');
            
            const message = this.formatOrderMessage(order);
            const success = await this.sendTelegram(message);
            
            if (success) {
                console.log('✅ Telegram notification sent successfully!');
                return true;
            } else {
                console.log('❌ Telegram failed, logging to console');
                this.logToConsole(order);
                return true;
            }
            
        } catch (error) {
            console.error('❌ Notification error:', error.message);
            this.logToConsole(order);
            return true;
        }
    }

    async sendTelegram(message) {
        try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;

            console.log('🔗 Sending to Telegram...');
            const response = await axios.post(
                `https://api.telegram.org/bot${botToken}/sendMessage`,
                {
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                },
                { timeout: 10000 }
            );

            console.log('✅ Telegram message delivered!');
            return true;
            
        } catch (error) {
            console.error('❌ Telegram API error:', error.response?.data || error.message);
            return false;
        }
    }

    logToConsole(order) {
        console.log('\n📱 ===== ORDER NOTIFICATION =====');
        console.log(`🆔 Order ID: ${order._id.toString().slice(-6).toUpperCase()}`);
        console.log(`💰 Amount: Rs. ${order.totalPrice}`);
        console.log(`👤 Customer: ${order.shippingAddress?.name || 'N/A'}`);
        console.log(`📞 Phone: ${order.shippingAddress?.phone || 'N/A'}`);
        console.log(`🏠 Address: ${order.shippingAddress?.address || 'N/A'}`);
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);
        console.log('📱 ==============================\n');
    }

    formatOrderMessage(order) {
        const customerName = order.shippingAddress?.name || 'N/A';
        const customerPhone = order.shippingAddress?.phone || 'N/A';
        const customerAddress = order.shippingAddress?.address || 'N/A';
        
        const itemsText = order.items.map(item => 
            `• ${item.name} - Rs. ${item.price} x ${item.quantity}`
        ).join('\n');

        return `🛒 *NEW ORDER - UKZai.shop*

📦 *Order ID:* ${order._id.toString().slice(-6).toUpperCase()}
💰 *Total:* Rs. ${order.totalPrice}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
🏠 *Address:* ${customerAddress}
⏰ *Time:* ${new Date(order.createdAt).toLocaleString()}

*📋 Items:*
${itemsText}

[View in Admin Panel](https://ukzai.shop/admin)`;
    }
}

module.exports = new WhatsAppService();