import { Button } from '@components/common/ui/Button.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { Download, FileText, ShieldCheck } from 'lucide-react';
import React from 'react';

interface SupportDocument {
  type: string;
  title: string;
  summary?: string;
  details?: string[];
}

interface OrderDownloadItem {
  productName: string;
  productSku: string;
  qty: number;
  lineTotalInclTax?: {
    text: string;
  };
  productSupportDocuments?: SupportDocument[];
}

interface OrderDownloadsProps {
  order: {
    orderNumber: string;
    customerFullName?: string;
    customerEmail?: string;
    paymentMethodName?: string;
    shippingMethodName?: string;
    createdAt?: {
      text: string;
    };
    shippingFeeInclTax?: {
      text: string;
    };
    subTotalInclTax?: {
      text: string;
    };
    totalTaxAmount?: {
      text: string;
    };
    grandTotal?: {
      text: string;
    };
    items: OrderDownloadItem[];
  };
}

const escapeHtml = (value: string | number | undefined | null) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const downloadHtml = (filename: string, html: string) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const documentShell = (title: string, body: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #17130a; margin: 32px; }
      .brand { font-weight: 800; color: #8b6508; letter-spacing: .04em; text-transform: uppercase; }
      h1 { margin: 8px 0 24px; }
      table { border-collapse: collapse; width: 100%; margin-top: 18px; }
      th, td { border-bottom: 1px solid #e7d8a8; padding: 10px; text-align: left; }
      th { background: #fff7df; }
      .panel { border: 1px solid #e7d8a8; border-radius: 8px; padding: 18px; margin: 16px 0; }
      .total { font-size: 18px; font-weight: 800; }
      li { margin: 6px 0; }
    </style>
  </head>
  <body>
    <div class="brand">Baghel Digital</div>
    ${body}
  </body>
</html>`;

const buildInvoiceHtml = (order: OrderDownloadsProps['order']) =>
  documentShell(
    `Invoice ${order.orderNumber}`,
    `<h1>Invoice #${escapeHtml(order.orderNumber)}</h1>
    <div class="panel">
      <div><strong>Customer:</strong> ${escapeHtml(order.customerFullName)}</div>
      <div><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</div>
      <div><strong>Order date:</strong> ${escapeHtml(order.createdAt?.text)}</div>
      <div><strong>Payment:</strong> ${escapeHtml(order.paymentMethodName)}</div>
      <div><strong>Shipping:</strong> ${escapeHtml(order.shippingMethodName || 'Local Delivery')}</div>
    </div>
    <table>
      <thead>
        <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `<tr>
              <td>${escapeHtml(item.productName)}</td>
              <td>${escapeHtml(item.productSku)}</td>
              <td>${escapeHtml(item.qty)}</td>
              <td>${escapeHtml(item.lineTotalInclTax?.text)}</td>
            </tr>`
          )
          .join('')}
      </tbody>
    </table>
    <div class="panel">
      <div><strong>Subtotal:</strong> ${escapeHtml(order.subTotalInclTax?.text)}</div>
      <div><strong>Shipping:</strong> ${escapeHtml(order.shippingFeeInclTax?.text)}</div>
      <div><strong>Tax:</strong> ${escapeHtml(order.totalTaxAmount?.text)}</div>
      <div class="total">Grand Total: ${escapeHtml(order.grandTotal?.text)}</div>
    </div>
    <p>This invoice is generated for the customer order record.</p>`
  );

const buildSupportHtml = (
  orderNumber: string,
  item: OrderDownloadItem,
  document: SupportDocument
) =>
  documentShell(
    `${document.title} ${item.productSku}`,
    `<h1>${escapeHtml(document.title)}</h1>
    <div class="panel">
      <div><strong>Order:</strong> #${escapeHtml(orderNumber)}</div>
      <div><strong>Product:</strong> ${escapeHtml(item.productName)}</div>
      <div><strong>SKU:</strong> ${escapeHtml(item.productSku)}</div>
      ${document.summary ? `<p>${escapeHtml(document.summary)}</p>` : ''}
    </div>
    ${
      document.details?.length
        ? `<ul>${document.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>`
        : ''
    }`
  );

export default function OrderDownloads({ order }: OrderDownloadsProps) {
  const supportDocuments = order.items.flatMap((item) =>
    (item.productSupportDocuments || []).map((document) => ({
      item,
      document
    }))
  );

  return (
    <div className="baghel-order-downloads">
      <div className="baghel-order-downloads__header">
        <div>
          <span>{_('Order Documents')}</span>
          <h3>{_('Invoice and product support')}</h3>
        </div>
        <Button
          variant="default"
          onClick={() =>
            downloadHtml(
              `invoice-${order.orderNumber}.html`,
              buildInvoiceHtml(order)
            )
          }
        >
          <Download size={16} />
          {_('Download Invoice')}
        </Button>
      </div>
      {supportDocuments.length > 0 && (
        <div className="baghel-order-downloads__grid">
          {supportDocuments.map(({ item, document }, index) => (
            <div
              className="baghel-order-downloads__doc"
              key={`${item.productSku}-${document.type}-${index}`}
            >
              {document.type === 'warranty' ? (
                <ShieldCheck size={20} />
              ) : (
                <FileText size={20} />
              )}
              <div>
                <strong>{document.title}</strong>
                <span>{item.productName}</span>
                <button
                  type="button"
                  onClick={() =>
                    downloadHtml(
                      `${document.type}-${item.productSku}-${order.orderNumber}.html`,
                      buildSupportHtml(order.orderNumber, item, document)
                    )
                  }
                >
                  {_('Download')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'checkoutSuccessPageLeft',
  sortOrder: 15
};

export const query = `
  query Query {
    order(uuid: getContextValue('orderId')) {
      orderNumber
      customerFullName
      customerEmail
      paymentMethodName
      shippingMethodName
      createdAt {
        text
      }
      shippingFeeInclTax {
        text
      }
      subTotalInclTax {
        text
      }
      totalTaxAmount {
        text
      }
      grandTotal {
        text
      }
      items {
        productName
        productSku
        qty
        lineTotalInclTax {
          text
        }
        productSupportDocuments {
          type
          title
          summary
          details
        }
      }
    }
  }
`;
