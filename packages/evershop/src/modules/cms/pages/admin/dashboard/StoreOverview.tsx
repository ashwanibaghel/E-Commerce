import {
  BadgeIndianRupee,
  Boxes,
  ClipboardList,
  Eye,
  PackagePlus,
  ReceiptText,
  Users
} from 'lucide-react';
import React from 'react';

interface StoreOverviewProps {
  products?: { total: number };
  orders?: { total: number };
  customers?: { total: number };
  productNew: string;
  productGrid: string;
  orderGrid: string;
  customerGrid: string;
  storeUrl: string;
}

export default function StoreOverview({
  products,
  orders,
  customers,
  productNew,
  productGrid,
  orderGrid,
  customerGrid,
  storeUrl
}: StoreOverviewProps) {
  const stats = [
    {
      icon: ClipboardList,
      label: 'Orders',
      value: orders?.total ?? 0,
      helper: 'New customer orders',
      href: orderGrid
    },
    {
      icon: Boxes,
      label: 'Products',
      value: products?.total ?? 0,
      helper: 'Items in catalog',
      href: productGrid
    },
    {
      icon: Users,
      label: 'Customers',
      value: customers?.total ?? 0,
      helper: 'Registered buyers',
      href: customerGrid
    },
    {
      icon: BadgeIndianRupee,
      label: 'Payment',
      value: 'COD',
      helper: 'Cash on Delivery active',
      href: orderGrid
    }
  ];

  return (
    <section className="baghel-admin-overview">
      <div className="baghel-admin-overview__hero">
        <div>
          <p>Baghel Digital Control Center</p>
          <h2>Manage products, orders and customers from one clean screen.</h2>
        </div>
        <div className="baghel-admin-overview__actions">
          <a href={productNew}>
            <PackagePlus size={18} aria-hidden="true" />
            Add product
          </a>
          <a href={orderGrid}>
            <ReceiptText size={18} aria-hidden="true" />
            View orders
          </a>
          <a href={storeUrl} target="_blank" rel="noreferrer">
            <Eye size={18} aria-hidden="true" />
            Open store
          </a>
        </div>
      </div>

      <div className="baghel-admin-overview__stats">
        {stats.map(({ icon: Icon, label, value, helper, href }) => (
          <a href={href} className="baghel-admin-stat" key={label}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{helper}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'dashboardOverview',
  sortOrder: 5
};

export const query = `
  query Query {
    products(filters: [{ key: "limit", operation: eq, value: "1" }]) {
      total
    }
    orders(filters: [{ key: "limit", operation: eq, value: "1" }]) {
      total
    }
    customers(filters: [{ key: "limit", operation: eq, value: "1" }]) {
      total
    }
    productNew: url(routeId: "productNew")
    productGrid: url(routeId: "productGrid")
    orderGrid: url(routeId: "orderGrid")
    customerGrid: url(routeId: "customerGrid")
    storeUrl: url(routeId: "homepage")
  }
`;
