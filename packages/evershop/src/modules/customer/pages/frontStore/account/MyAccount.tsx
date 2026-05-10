import Area from '@components/common/Area.js';
import AccountInfo from '@components/frontStore/customer/AccountInfo.js';
import { MyAddresses } from '@components/frontStore/customer/MyAddresses.js';
import OrderHistory from '@components/frontStore/customer/OrderHistory.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { MapPin, PackageCheck, ShieldCheck, ShoppingBag } from 'lucide-react';
import React from 'react';

export default function MyAccount() {
  return (
    <div className="baghel-account-page">
      <section className="baghel-account-hero page-width">
        <div>
          <p>Baghel Digital member space</p>
          <h1>{_('My Account')}</h1>
          <span>
            Track orders, manage delivery addresses and keep your premium
            electronics purchases organized.
          </span>
        </div>
        <div className="baghel-account-hero__badges">
          <span>
            <ShieldCheck size={17} />
            Secure account
          </span>
          <span>
            <PackageCheck size={17} />
            COD ready
          </span>
        </div>
      </section>

      <section className="baghel-account-actions page-width">
        <a href="/electronics">
          <ShoppingBag size={19} />
          <span>Continue shopping</span>
        </a>
        <a href="#recent-orders">
          <PackageCheck size={19} />
          <span>View orders</span>
        </a>
        <a href="#address-book">
          <MapPin size={19} />
          <span>Manage address</span>
        </a>
      </section>

      <div className="baghel-account-grid page-width">
        <div id="recent-orders" className="baghel-account-main">
          <OrderHistory title={_('Recent Orders')} />
        </div>
        <aside className="baghel-account-side">
          <AccountInfo title={_('Account Information')} showLogout />
        </aside>
      </div>

      <div id="address-book" className="baghel-account-address page-width">
        <MyAddresses title={_('Address Book')} />
        <Area id="accountPageAddressBook" noOuter />
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
