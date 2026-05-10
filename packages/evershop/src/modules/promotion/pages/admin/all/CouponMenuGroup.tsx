interface CouponMenuGroupProps {
  couponGrid: string;
}

export default function CatalogMenuGroup({ couponGrid }: CouponMenuGroupProps) {
  return null;
}

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 50
};

export const query = `
  query Query {
    couponGrid: url(routeId:"couponGrid")
  }
`;
