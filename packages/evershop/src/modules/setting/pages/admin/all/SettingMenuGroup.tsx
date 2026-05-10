interface CmsMenuGroupProps {
  storeSetting: string;
}

export default function CmsMenuGroup({ storeSetting }: CmsMenuGroupProps) {
  return null;
}

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 500
};

export const query = `
  query Query {
    storeSetting: url(routeId:"storeSetting")
  }
`;
