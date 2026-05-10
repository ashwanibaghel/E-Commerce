import {
  BadgeIndianRupee,
  Headphones,
  ShieldCheck,
  Truck
} from 'lucide-react';
import React from 'react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Premium Warranty',
    text: 'Selected electronics with trusted support'
  },
  {
    icon: Truck,
    title: 'Cash on Delivery',
    text: 'COD available for local customer confidence'
  },
  {
    icon: BadgeIndianRupee,
    title: 'Best Deal Promise',
    text: 'Premium products with honest shop pricing'
  },
  {
    icon: Headphones,
    title: 'After Sales Help',
    text: 'Friendly guidance for setup and upgrades'
  }
];

export default function PremiumTrustStrip() {
  return (
    <section className="baghel-trust-strip">
      <div className="page-width baghel-trust-strip__grid">
        {features.map(({ icon: Icon, title, text }) => (
          <div className="baghel-trust-strip__item" key={title}>
            <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 12
};
