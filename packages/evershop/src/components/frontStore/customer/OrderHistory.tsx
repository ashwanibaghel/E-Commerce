import { Image } from '@components/common/Image.js';
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail.js';
import {
  Order,
  useCustomer
} from '@components/frontStore/customer/CustomerContext.jsx';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { Download, FileText, PackageCheck, ShoppingBag } from 'lucide-react';
import React from 'react';

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

const shell = (title: string, body: string) => `<!doctype html>
<html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>
<style>
body{font-family:Arial,sans-serif;color:#17130a;margin:32px}.brand{font-weight:800;color:#8b6508;text-transform:uppercase}
table{border-collapse:collapse;width:100%;margin-top:18px}th,td{border-bottom:1px solid #e7d8a8;padding:10px;text-align:left}th{background:#fff7df}
.panel{border:1px solid #e7d8a8;border-radius:8px;padding:18px;margin:16px 0}.total{font-size:18px;font-weight:800}li{margin:6px 0}
</style></head><body><div class="brand">Baghel Digital</div>${body}</body></html>`;

const invoiceHtml = (order: Order) =>
  shell(
    `Invoice ${order.orderNumber}`,
    `<h1>Invoice #${escapeHtml(order.orderNumber)}</h1>
    <div class="panel">
      <div><strong>Customer:</strong> ${escapeHtml(order.customerFullName)}</div>
      <div><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</div>
      <div><strong>Order date:</strong> ${escapeHtml(order.createdAt.text)}</div>
      <div><strong>Payment:</strong> ${escapeHtml(order.paymentMethodName)}</div>
      <div><strong>Shipping:</strong> ${escapeHtml(order.shippingMethodName)}</div>
    </div>
    <table><thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Total</th></tr></thead><tbody>
    ${order.items
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.productName)}</td><td>${escapeHtml(item.productSku)}</td><td>${escapeHtml(item.qty)}</td><td>${escapeHtml(item.lineTotalInclTax.text)}</td></tr>`
      )
      .join('')}
    </tbody></table>
    <div class="panel">
      <div><strong>Subtotal:</strong> ${escapeHtml(order.subTotalInclTax.text)}</div>
      <div><strong>Shipping:</strong> ${escapeHtml(order.shippingFeeInclTax.text)}</div>
      <div><strong>Tax:</strong> ${escapeHtml(order.totalTaxAmount.text)}</div>
      <div class="total">Grand Total: ${escapeHtml(order.grandTotal.text)}</div>
    </div>`
  );

const supportHtml = (
  order: Order,
  item: Order['items'][number],
  document: NonNullable<Order['items'][number]['productSupportDocuments']>[number]
) =>
  shell(
    `${document.title} ${item.productSku}`,
    `<h1>${escapeHtml(document.title)}</h1>
    <div class="panel">
      <div><strong>Order:</strong> #${escapeHtml(order.orderNumber)}</div>
      <div><strong>Product:</strong> ${escapeHtml(item.productName)}</div>
      <div><strong>SKU:</strong> ${escapeHtml(item.productSku)}</div>
      ${document.summary ? `<p>${escapeHtml(document.summary)}</p>` : ''}
    </div>
    ${document.details?.length ? `<ul>${document.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>` : ''}`
  );

const getOrderProgress = (order: Order) => {
  const shipmentCode = order.shipmentStatus?.code || 'pending';
  const paymentCode = order.paymentStatus?.code || 'pending';
  const canceled = shipmentCode === 'canceled' || paymentCode === 'canceled';
  const activeIndex = canceled
    ? 0
    : shipmentCode === 'delivered'
      ? 4
      : shipmentCode === 'shipped'
        ? 3
        : shipmentCode === 'processing'
          ? 2
          : paymentCode === 'paid'
            ? 1
            : 0;

  return [
    {
      label: canceled ? 'Rejected' : 'Placed',
      active: true,
      tone: canceled ? 'danger' : 'done'
    },
    {
      label: 'Payment',
      active: !canceled && activeIndex >= 1,
      tone: paymentCode === 'paid' ? 'done' : 'pending'
    },
    {
      label: 'Confirmed',
      active: !canceled && activeIndex >= 2,
      tone: activeIndex >= 2 ? 'done' : 'pending'
    },
    {
      label: 'Shipped',
      active: !canceled && activeIndex >= 3,
      tone: activeIndex >= 3 ? 'done' : 'pending'
    },
    {
      label: 'Delivered',
      active: !canceled && activeIndex >= 4,
      tone: activeIndex >= 4 ? 'done' : 'pending'
    }
  ];
};

const OrderDetail: React.FC<{ order: Order }> = ({ order }) => {
  const supportDocuments = order.items.flatMap((item) =>
    (item.productSupportDocuments || []).map((document) => ({
      item,
      document
    }))
  );
  const progress = getOrderProgress(order);

  return (
    <div className="order border-divider">
      <div className="order-inner grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="order-items col-span-2">
          {order.items.map((item) => (
            <div
              className="order-item mb-2 flex gap-5 items-center"
              key={item.productSku}
            >
              <div className="thumbnail border border-divider p-2 rounded">
                {item.thumbnail && (
                  <Image
                    width={50}
                    height={50}
                    style={{ maxWidth: '6rem' }}
                    src={item.thumbnail}
                    alt={item.productName}
                  />
                )}
                {!item.thumbnail && (
                  <ProductNoThumbnail width={50} height={50} />
                )}
              </div>
              <div className="order-item-info">
                <div className="order-item-name font-semibold">
                  {item.productName}
                </div>
                <div className="order-item-sku italic">
                  {_('Sku')}: #{item.productSku}
                </div>
                <div className="order-item-qty">
                  {item.qty} x {item.productPrice.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="order-total col-span-1">
          <div className="order-header">
            <div className="order-number">
              <span className="font-bold">
                {_('Order')}: #{order.orderNumber}
              </span>
              <span className="italic pl-2">{order.createdAt.text}</span>
            </div>
          </div>
          <div className="order-total-value font-bold">
            {_('Total')}:{order.grandTotal.text}
          </div>
          <div className="baghel-order-status-card">
            <div>
              <span>Order Status</span>
              <strong>{order.status?.name || 'Processing'}</strong>
            </div>
            <div>
              <span>Shipment</span>
              <strong>{order.shipmentStatus?.name || 'Pending'}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>{order.paymentStatus?.name || 'Pending'}</strong>
            </div>
          </div>
          <div className="baghel-order-progress" aria-label="Order progress">
            {progress.map((step) => (
              <div
                key={step.label}
                className={[
                  'baghel-order-progress__step',
                  step.active ? 'is-active' : '',
                  step.tone === 'danger' ? 'is-danger' : ''
                ].join(' ')}
              >
                <span />
                <small>{step.label}</small>
              </div>
            ))}
          </div>
          <div className="baghel-order-history-actions">
            <button
              type="button"
              onClick={() =>
                downloadHtml(
                  `invoice-${order.orderNumber}.html`,
                  invoiceHtml(order)
                )
              }
            >
              <Download size={15} />
              {_('Invoice')}
            </button>
            {supportDocuments.slice(0, 2).map(({ item, document }, index) => (
              <button
                type="button"
                key={`${item.productSku}-${document.type}-${index}`}
                onClick={() =>
                  downloadHtml(
                    `${document.type}-${item.productSku}-${order.orderNumber}.html`,
                    supportHtml(order, item, document)
                  )
                }
              >
                <FileText size={15} />
                {document.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrderHistory({ title }: { title?: string }) {
  const { customer } = useCustomer();
  const orders = customer?.orders || [];
  return (
    <div className="order-history baghel-account-card">
      <div className="baghel-account-card__header">
        <div>
          <span>Purchases</span>
          {title && <h2 className="order-history-title">{title}</h2>}
        </div>
        <div className="baghel-account-count">
          <PackageCheck size={17} />
          {orders.length}
        </div>
      </div>
      {orders.length === 0 && (
        <div className="order-history-empty baghel-empty-state">
          <ShoppingBag size={28} />
          <strong>{_('You have not placed any orders yet')}</strong>
          <span>
            Your electronics orders, invoices and COD updates will appear here
            after checkout.
          </span>
          <a href="/electronics">Explore electronics</a>
        </div>
      )}
      {orders.map((order) => (
        <div
          className="order-history-order border-divider py-5"
          key={order.orderId}
        >
          <OrderDetail order={order} key={order.orderId} />
        </div>
      ))}
    </div>
  );
}
