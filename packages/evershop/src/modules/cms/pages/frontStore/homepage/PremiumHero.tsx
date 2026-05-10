import { ArrowRight, BadgeIndianRupee, ShieldCheck, Truck } from 'lucide-react';
import React from 'react';

const heroProducts = [
  {
    name: 'SmartView 55 4K TV',
    image: '/assets/demo-electronics/smartview-55.svg'
  },
  {
    name: 'GalaxyPro 5G Phone',
    image: '/assets/demo-electronics/galaxy-phone.svg'
  },
  {
    name: 'BassMax Headphones',
    image: '/assets/demo-electronics/headphones.svg'
  }
];

export default function PremiumHero() {
  return (
    <section className="baghel-home-hero">
      <div className="page-width baghel-home-hero__inner">
        <div className="baghel-home-hero__copy">
          <span className="baghel-home-hero__kicker">Baghel Digital</span>
          <h1>Premium Electronics for Home, Office and Smart Living</h1>
          <p>
            Shop TVs, phones, laptops, audio, appliances and smart gadgets with
            clear INR pricing, local support and Cash on Delivery.
          </p>
          <div className="baghel-home-hero__actions">
            <a href="/electronics">
              Shop electronics
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <span>Trusted local demo store</span>
          </div>
          <div className="baghel-home-hero__badges" aria-label="Store benefits">
            <span>
              <Truck size={17} aria-hidden="true" />
              COD available
            </span>
            <span>
              <ShieldCheck size={17} aria-hidden="true" />
              Warranty support
            </span>
            <span>
              <BadgeIndianRupee size={17} aria-hidden="true" />
              INR pricing
            </span>
          </div>
        </div>
        <div
          className="baghel-home-hero__showcase"
          aria-label="Featured electronics"
        >
          {heroProducts.map((product, index) => (
            <div
              className={`baghel-home-hero__device baghel-home-hero__device--${index + 1}`}
              key={product.name}
            >
              <img src={product.image} alt={product.name} loading="eager" />
              <strong>{product.name}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 8
};
