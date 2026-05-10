import PropTypes from 'prop-types';

export default function NewProductQuickLink({ productNew }) {
  return null;
}

NewProductQuickLink.propTypes = {
  productNew: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'quickLinks',
  sortOrder: 20
};

export const query = `
  query Query {
    productNew: url(routeId:"productNew")
  }
`;
