import type { Order } from '@/types/models'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export function printOrderReceipt(order: Order) {
  const printWindow = window.open('', '_blank', 'width=400,height=600')
  if (!printWindow) return

  const itemsHtml = order.items?.map(item => `
    <div class="item">
      <div class="row">
        <span class="qty">${item.quantity}x</span>
        <span class="name">${item.product?.name} ${item.variant ? `(${item.variant.name})` : ''}</span>
        <span class="price">${formatCurrency(item.unit_price * item.quantity)}</span>
      </div>
      ${item.notes ? `<div class="notes">Note: ${item.notes}</div>` : ''}
    </div>
  `).join('') || ''

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ordine #${order.order_number}</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          width: 80mm; /* Standard termico */
          margin: 0;
          padding: 10px;
          color: #000;
        }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .title { font-size: 20px; font-weight: bold; }
        .meta { font-size: 12px; margin-top: 5px; }
        .items { margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .item { margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; }
        .qty { font-weight: bold; margin-right: 5px; min-width: 25px; }
        .name { flex-grow: 1; text-align: left; }
        .price { white-space: nowrap; margin-left: 5px; }
        .notes { font-size: 11px; font-style: italic; margin-left: 30px; }
        .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        @media print {
          @page { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Proloco Sagra</div>
        <div class="meta">Ordine #${order.order_number}</div>
        <div class="meta">${formatDate(order.created_at)}</div>
        <div class="meta">Ospite: ${order.guest_name || 'Anonimo'}</div>
      </div>

      <div class="items">
        ${itemsHtml}
      </div>

      <div class="total">
        <span>TOTALE</span>
        <span>${formatCurrency(order.total_amount)}</span>
      </div>

      <div class="footer">
        <p>Grazie e buon appetito!</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}