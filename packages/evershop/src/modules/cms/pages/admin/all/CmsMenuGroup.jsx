import PropTypes from 'prop-types';

export default function CmsMenuGroup({ cmsPageGrid, widgetGrid }) {
  return null;
}

CmsMenuGroup.propTypes = {
  cmsPageGrid: PropTypes.string.isRequired,
  widgetGrid: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 60
};

export const query = `
  query Query {
    cmsPageGrid: url(routeId:"cmsPageGrid")
    widgetGrid: url(routeId:"widgetGrid")
  }
`;
