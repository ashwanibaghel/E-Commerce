interface NewCouponQuickLinkProps {
  couponNew: string;
}

export default function NewProductQuickLink({
  couponNew
}: NewCouponQuickLinkProps) {
  return null;
}

export const layout = {
  areaId: 'quickLinks',
  sortOrder: 30
};

export const query = `
  query Query {
    couponNew: url(routeId:"couponNew")
  }
`;
