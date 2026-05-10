import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import { getProductDetails } from '@components/frontStore/catalog/productDetails.js';
import {
  BadgeCheck,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Truck
} from 'lucide-react';
import React from 'react';

export function ProductPurchasePanel() {
  const product = useProduct();
  const details = getProductDetails(product);

  return (
    <div className="baghel-product-buy-panel">
      <div className="baghel-product-buy-panel__stock">
        <BadgeCheck size={18} aria-hidden="true" />
        <span>
          {product.inventory.isInStock
            ? 'In stock and ready for order'
            : 'Currently out of stock'}
        </span>
      </div>

      <div className="baghel-product-highlights">
        <h2>Key Highlights</h2>
        <ul>
          {details.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>

      <div className="baghel-product-service-grid">
        <div>
          <Truck size={20} aria-hidden="true" />
          <span>Fast local delivery</span>
        </div>
        <div>
          <CreditCard size={20} aria-hidden="true" />
          <span>Cash on Delivery</span>
        </div>
        <div>
          <ShieldCheck size={20} aria-hidden="true" />
          <span>Warranty support</span>
        </div>
        <div>
          <PackageCheck size={20} aria-hidden="true" />
          <span>Secure packaging</span>
        </div>
      </div>
    </div>
  );
}
