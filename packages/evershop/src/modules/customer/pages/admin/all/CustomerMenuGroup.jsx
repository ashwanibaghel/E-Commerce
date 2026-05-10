import PropTypes from 'prop-types';

export default function CustomerMenuGroup({ customerGrid }) {
  return null;
}

CustomerMenuGroup.propTypes = {
  customerGrid: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 40
};

export const query = `
  query Query {
    customerGrid: url(routeId:"customerGrid")
  }
`;
