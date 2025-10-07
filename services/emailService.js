// backend/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendOrderNotification(order) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: `🛒 New Order #${order._id.toString().slice(-6).toUpperCase()} - UKZai.shop`,
                html: this.getEmailTemplate(order)
            };

            await this.transporter.sendMail(mailOptions);
            console.log('📧 Email notification sent successfully!');
            return true;
        } catch (error) {
            console.error('❌ Email notification failed:', error.message);
            return false;
        }
    }

    getEmailTemplate(order) {
        const customerName = order.shippingAddress?.name || 'N/A';
        const customerPhone = order.shippingAddress?.phone || 'N/A';
        const customerAddress = order.shippingAddress?.address || 'N/A';
        
        const itemsHtml = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>Rs. ${item.price}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.price * item.quantity}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f6f6f6; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .order-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
                    .detail-label { font-weight: bold; color: #555; }
                    .detail-value { color: #333; }
                    .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 New Order Received!</h1>
                        <p>UKZai.shop - Instant Notification</p>
                    </div>
                    
                    <div class="content">
                        <h2>Order Details</h2>
                        <div class="order-details">
                            <div class="detail-row">
                                <span class="detail-label">Order ID:</span>
                                <span class="detail-value">${order._id.toString().slice(-6).toUpperCase()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Total Amount:</span>
                                <span class="detail-value">Rs. ${order.totalPrice}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Customer Name:</span>
                                <span class="detail-value">${customerName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Customer Phone:</span>
                                <span class="detail-value">${customerPhone}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Customer Address:</span>
                                <span class="detail-value">${customerAddress}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Order Date:</span>
                                <span class="detail-value">${new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <a href="https://ukzai.shop/admin" class="button">
                            📋 View in Admin Panel
                        </a>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = new EmailService();