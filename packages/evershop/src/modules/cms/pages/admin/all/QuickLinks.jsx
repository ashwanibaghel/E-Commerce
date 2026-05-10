import { NavigationItemGroup } from '@components/admin/NavigationItemGroup';
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  TicketPercent,
  Users
} from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

export default function QuickLinks({
  couponGrid,
  customerGrid,
  dashboard,
  orderGrid,
  productGrid,
  storeSetting
}) {
  return (
    <NavigationItemGroup
      id="quickLinks"
      name="Store menu"
      items={[
        {
          Icon: LayoutDashboard,
          url: dashboard,
          title: 'Dashboard'
        },
        {
          Icon: ReceiptText,
          url: orderGrid,
          title: 'Orders'
        },
        {
          Icon: Package,
          url: productGrid,
          title: 'Products'
        },
        {
          Icon: Users,
          url: customerGrid,
          title: 'Customers'
        },
        {
          Icon: TicketPercent,
          url: couponGrid,
          title: 'Coupons'
        },
        {
          Icon: Settings,
          url: storeSetting,
          title: 'Settings'
        }
      ]}
    />
  );
}

QuickLinks.propTypes = {
  couponGrid: PropTypes.string.isRequired,
  customerGrid: PropTypes.string.isRequired,
  dashboard: PropTypes.string.isRequired,
  orderGrid: PropTypes.string.isRequired,
  productGrid: PropTypes.string.isRequired,
  storeSetting: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 10
};

export const query = `
  query Query {
    dashboard: url(routeId: "dashboard")
    orderGrid: url(routeId: "orderGrid")
    productGrid: url(routeId: "productGrid")
    customerGrid: url(routeId: "customerGrid")
    couponGrid: url(routeId: "couponGrid")
    storeSetting: url(routeId: "storeSetting")
  }
`;
