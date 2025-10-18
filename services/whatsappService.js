// backend/services/whatsappService.js - DEBUG VERSION
const axios = require('axios');

class WhatsAppService {
    async sendOrderNotification(order) {
        console.log('🟡 DEBUG: sendOrderNotification CALLED!');
        console.log('🟡 Order ID:', order._id);
        console.log('🟡 Customer:', order.shippingAddress?.name);
        console.log('🟡 Total Price:', order.totalPrice);
        
        try {
            const message = this.formatOrderMessage(order);
            console.log('🟡 Formatted message length:', message.length);
            
            const success = await this.sendTelegram(message);
            
            if (success) {
                console.log('✅ Telegram notification sent successfully to all numbers!');
                return true;
            } else {
                console.log('❌ Telegram failed, logging to console');
                this.logToConsole(order);
                return true;
            }
            
        } catch (error) {
            console.error('❌ Notification error:', error.message);
            console.error('❌ Full error:', error);
            this.logToConsole(order);
            return true;
        }
    }

    async sendTelegram(message) {
        try {
            console.log('🟡 DEBUG: sendTelegram called');
            
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            
            // ✅ MULTIPLE NUMBERS - Add all Chat IDs here
            const chatIds = [
                "7610582534",  // Your NEW number
                "8369649605"   // Your OLD number
                // Add more numbers: "ANOTHER_CHAT_ID_HERE"
            ];
            
            console.log('🟡 Bot Token exists:', !!botToken);
            console.log('🟡 Sending to Chat IDs:', chatIds);

            if (!botToken) {
                console.log('❌ Missing Telegram bot token');
                return false;
            }

            let allSuccess = true;

            // ✅ Send to EACH chat ID
            for (const chatId of chatIds) {
                try {
                    console.log(`📤 Sending to chat ID: ${chatId}`);
                    
                    const response = await axios.post(
                        `https://api.telegram.org/bot${botToken}/sendMessage`,
                        {
                            chat_id: chatId,
                            text: message,
                            parse_mode: 'Markdown'
                        },
                        { 
                            timeout: 10000,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    console.log(`✅ Sent successfully to ${chatId}`);
                    
                } catch (error) {
                    console.error(`❌ Failed to send to ${chatId}:`, error.message);
                    allSuccess = false;
                }
            }

            return allSuccess;
            
        } catch (error) {
            console.error('❌ Telegram API error:');
            console.error('❌ Error message:', error.message);
            if (error.response) {
                console.error('❌ Response status:', error.response.status);
                console.error('❌ Response data:', error.response.data);
            }
            return false;
        }
    }

    logToConsole(order) {
        console.log('\n📱 ===== ORDER NOTIFICATION (CONSOLE FALLBACK) =====');
        console.log(`🆔 Order ID: ${order._id.toString().slice(-6).toUpperCase()}`);
        console.log(`💰 Amount: Rs. ${order.totalPrice}`);
        console.log(`👤 Customer: ${order.shippingAddress?.name || 'N/A'}`);
        console.log(`📞 Phone: ${order.shippingAddress?.phone || 'N/A'}`);
        console.log(`🏠 Address: ${order.shippingAddress?.address || 'N/A'}`);
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);
        console.log('📱 =============================================\n');
    }

    formatOrderMessage(order) {
        const customerName = order.shippingAddress?.name || 'N/A';
        const customerPhone = order.shippingAddress?.phone || 'N/A';
        const customerAddress = order.shippingAddress?.address || 'N/A';
        
        const itemsText = order.items.map(item => 
            `• ${item.name} - Rs. ${item.price} x ${item.quantity}`
        ).join('\n');

        // ✅ FIXED: Define orderTime variable first
        const orderTime = new Date(order.createdAt).toLocaleString('en-PK', {
            timeZone: 'Asia/Karachi',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        return `🛒 *NEW ORDER - UKZai.shop*

📦 *Order ID:* ${order._id.toString().slice(-6).toUpperCase()}
💰 *Total:* Rs. ${order.totalPrice}
👤 *Customer:* ${customerName}
📞 *Phone:* ${customerPhone}
🏠 *Address:* ${customerAddress}
📍 City: ${order.shippingAddress?.city || 'N/A'}
📮 Postal Code: ${order.shippingAddress?.postalCode || 'N/A'}
⏰ *Time:* ${orderTime}

*📋 Items:*
${itemsText}

[View in Admin Panel](https://ukzai.shop/admin)`;
    }
}

module.exports = new WhatsAppService();