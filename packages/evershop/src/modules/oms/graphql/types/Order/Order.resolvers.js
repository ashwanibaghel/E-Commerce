import { select } from '@evershop/postgres-query-builder';
import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { camelCase } from '../../../../../lib/util/camelCase.js';
import { getConfig } from '../../../../../lib/util/getConfig.js';
import { getOrdersBaseQuery } from '../../../services/getOrdersBaseQuery.js';

const stripTags = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const getDescriptionHtml = (description) => {
  if (!description) {
    return '';
  }
  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description);
      return getDescriptionHtml(parsed);
    } catch {
      return description;
    }
  }
  if (Array.isArray(description)) {
    return description
      .flatMap((row) => row.columns || [])
      .flatMap((column) => column.data?.blocks || [])
      .map((block) => block.data?.html || block.data?.text || '')
      .join('\n');
  }
  return '';
};

const extractList = (html, className) => {
  const classPattern = className
    ? `[^"']*${className}[^"']*`
    : `[^"']*`;
  const match = html.match(
    new RegExp(
      `<ul[^>]*class=["']${classPattern}["'][^>]*>([\\s\\S]*?)<\\/ul>`,
      'i'
    )
  );
  const source = match ? match[1] : html;
  return Array.from(source.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map((item) => stripTags(item[1]))
    .filter(Boolean);
};

const extractWarranty = (html) => {
  const custom = html.match(
    /<p[^>]*class=["'][^"']*baghel-detail-warranty[^"']*["'][^>]*>([\s\S]*?)<\/p>/i
  );
  if (custom) {
    return stripTags(custom[1]);
  }
  const plain = stripTags(html);
  const warrantySentence = plain.match(/[^.]*warranty[^.]*\.?/i);
  return warrantySentence ? warrantySentence[0].trim() : '';
};

const getProductSupportDocuments = async (item, pool) => {
  const productDescription = await select()
    .from('product_description')
    .where('product_description_product_id', '=', item.productId)
    .load(pool);
  const html = getDescriptionHtml(productDescription?.description);
  if (!html) {
    return [];
  }

  const serviceNotes = extractList(html, 'baghel-detail-service');
  const simpleNotes = extractList(html);
  const boxContents = extractList(html, 'baghel-detail-box');
  const plainDescription = stripTags(html);
  const warranty =
    extractWarranty(html) ||
    (/warranty|support|after-sales/i.test(plainDescription)
      ? 'Warranty and support eligibility will be validated against the invoice, product serial details and applicable brand/store policy.'
      : '');
  const documents = [];

  if (warranty) {
    documents.push({
      type: 'warranty',
      title: 'Warranty Card',
      summary: warranty,
      details: [
        `Product: ${item.productName}`,
        `SKU: ${item.productSku}`,
        warranty,
        'Keep this invoice safely. Warranty/support claims are validated against the invoice and product serial details.'
      ]
    });
  }

  if (serviceNotes.length > 0 || simpleNotes.length > 0) {
    documents.push({
      type: 'service',
      title: 'Service & Support Notes',
      summary: 'Support information provided by the store for this product.',
      details: serviceNotes.length > 0 ? serviceNotes : simpleNotes
    });
  }

  if (boxContents.length > 0) {
    documents.push({
      type: 'box',
      title: 'Box Contents',
      summary: 'Items expected inside the package.',
      details: boxContents
    });
  }

  return documents;
};

export default {
  Query: {
    order: async (_, { uuid }, { pool }) => {
      const query = getOrdersBaseQuery();
      query.where('uuid', '=', uuid);
      const order = await query.load(pool);
      if (!order) {
        return null;
      } else {
        return camelCase(order);
      }
    }
  },
  Order: {
    items: async ({ orderId }, _, { pool }) => {
      const items = await select()
        .from('order_item')
        .where('order_item_order_id', '=', orderId)
        .execute(pool);
      return items.map((item) => camelCase(item));
    },
    shippingAddress: async ({ shippingAddressId }, _, { pool }) => {
      const address = await select()
        .from('order_address')
        .where('order_address_id', '=', shippingAddressId)
        .load(pool);
      return address ? camelCase(address) : null;
    },
    billingAddress: async ({ billingAddressId }, _, { pool }) => {
      const address = await select()
        .from('order_address')
        .where('order_address_id', '=', billingAddressId)
        .load(pool);
      return address ? camelCase(address) : null;
    },
    activities: async ({ orderId }, _, { pool }) => {
      const query = select().from('order_activity');
      query.where('order_activity_order_id', '=', orderId);
      query.orderBy('order_activity_id', 'DESC');
      const activities = await query.execute(pool);
      return activities
        ? activities.map((activity) => camelCase(activity))
        : null;
    },
    shipment: async ({ orderId, uuid }, _, { pool }) => {
      const shipment = await select()
        .from('shipment')
        .where('shipment_order_id', '=', orderId)
        .load(pool);
      return shipment ? { ...camelCase(shipment), orderUuid: uuid } : null;
    },
    shipmentStatus: ({ shipmentStatus }) => {
      const statusList = getConfig('oms.order.shipmentStatus', {});
      const status = statusList[shipmentStatus] || {
        name: 'Unknown',
        code: shipmentStatus,
        badge: 'default'
      };

      return {
        ...status,
        code: shipmentStatus
      };
    },
    paymentStatus: ({ paymentStatus }) => {
      const statusList = getConfig('oms.order.paymentStatus', {});
      const status = statusList[paymentStatus] || {
        name: 'Unknown',
        code: paymentStatus,
        badge: 'default'
      };

      return {
        ...status,
        code: paymentStatus
      };
    },
    status: ({ status }) => {
      const statusList = getConfig('oms.order.status', {});
      const statusObj = statusList[status] || {
        name: 'Unknown',
        code: status,
        badge: 'default'
      };

      return {
        ...statusObj,
        code: status
      };
    }
  },
  Customer: {
    orders: async ({ customerId }, _, { pool }) => {
      const orders = await select()
        .from('order')
        .where('order.customer_id', '=', customerId)
        .execute(pool);
      return orders.map((row) => camelCase(row));
    }
  },
  OrderItem: {
    productUrl: async ({ productId }, _, { pool }) => {
      const product = await select()
        .from('product')
        .where('product_id', '=', productId)
        .load(pool);
      return product ? buildUrl('productEdit', { id: product.uuid }) : null;
    },
    productSupportDocuments: async (item, _, { pool }) =>
      getProductSupportDocuments(item, pool),
    total: ({ lineTotalInclTax }) =>
      // This field is deprecated, use lineTotalInclTax instead
      lineTotalInclTax,
    subTotal: ({ lineTotal }) =>
      // This field is deprecated, use lineTotal instead
      lineTotal,
    variantOptions: ({ variantOptions }) => {
      try {
        return JSON.parse(variantOptions || '[]').map((option) => ({
          ...camelCase(option),
          attributeId: parseInt(option.attribute_id, 10),
          optionId: parseInt(option.option_id, 10)
        }));
      } catch (error) {
        return [];
      }
    }
  }
};
