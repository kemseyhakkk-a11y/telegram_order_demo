import { useRef } from 'react';
import html2canvas from 'html2canvas';

export function generateReceiptImage(cart, total, orderId, customerName, restaurantName = 'Tasty Bites') {
  return new Promise(async (resolve) => {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 320px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: 'Courier New', monospace;
      color: #e4e4e7;
      padding: 24px;
      border-radius: 0;
    `;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const date = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let itemsHtml = cart.map(item => `
      <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 13px;">
        <span style="flex: 1;">${item.image_emoji || '🍽️'} ${item.name}</span>
        <span style="text-align: right; min-width: 80px;">x${item.quantity}</span>
        <span style="text-align: right; min-width: 60px;">$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 32px; margin-bottom: 4px;">🍽️</div>
        <div style="font-size: 18px; font-weight: bold; color: #10b981; letter-spacing: 2px;">${restaurantName}</div>
        <div style="font-size: 10px; color: #71717a; margin-top: 4px;">ORDER CONFIRMATION</div>
      </div>
      
      <div style="border-top: 2px dashed #334155; border-bottom: 2px dashed #334155; padding: 16px 0; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #a1a1aa; margin-bottom: 8px;">
          <span>Order #${orderId}</span>
          <span>${date}</span>
        </div>
        <div style="font-size: 14px; color: #e4e4e7;">Customer: ${customerName}</div>
        <div style="font-size: 12px; color: #10b981; margin-top: 4px;">📍 Pickup Order</div>
      </div>
      
      <div style="margin: 16px 0;">
        ${itemsHtml}
      </div>
      
      <div style="border-top: 2px dashed #334155; padding-top: 16px; margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; font-size: 14px; color: #a1a1aa;">
          <span>Items:</span>
          <span>${totalItems}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #10b981; margin-top: 8px;">
          <span>TOTAL:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #71717a;">
        <div>─────────────────────</div>
        <div style="margin-top: 12px;">✅ Order received!</div>
        <div style="margin-top: 4px;">We'll prepare it shortly.</div>
        <div style="margin-top: 16px; font-size: 10px; color: #52525b;">Thank you for ordering via Telegram</div>
      </div>
    `;

    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      backgroundColor: '#1a1a2e',
      scale: 2,
      width: 320,
    });

    document.body.removeChild(container);

    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}