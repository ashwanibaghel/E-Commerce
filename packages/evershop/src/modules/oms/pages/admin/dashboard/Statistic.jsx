import { Card, CardHeader, CardTitle, CardContent } from '@components/common/ui/Card.js';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './Statistic.scss';
import { ClipboardList, PackagePlus, ShoppingBag } from 'lucide-react';

export default function SaleStatistic({ api }) {
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (window !== undefined) {
      fetch(`${api}?period=monthly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((json) => {
          setData(Array.isArray(json) ? json : []);
          setFetching(false);
        })
        .catch((error) => {
          toast.error(error.message);
          setData([]);
          setFetching(false);
        });
    }
  }, []);

  const totalOrders = data.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );
  const totalSales = data.reduce(
    (sum, item) => sum + Number(item.total || item.value || 0),
    0
  );

  if (fetching) {
    return (
      <Card className="baghel-admin-card">
        <CardHeader>
          <CardTitle>Store Activity</CardTitle>
        </CardHeader>
        <div className="skeleton-wrapper-statistic">
          <div className="skeleton" />
        </div>
      </Card>
    );
  } else {
    return (
      <Card className="baghel-admin-card baghel-admin-store-activity">
        <CardHeader>
          <CardTitle>Store Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="baghel-admin-action-list">
            <div>
              <ShoppingBag size={20} />
              <span>Monthly orders</span>
              <strong>{totalOrders}</strong>
            </div>
            <div>
              <ClipboardList size={20} />
              <span>Monthly sales</span>
              <strong>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(totalSales)}
              </strong>
            </div>
            <div>
              <PackagePlus size={20} />
              <span>Next step</span>
              <strong>Keep catalog updated</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

SaleStatistic.propTypes = {
  api: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'leftSide',
  sortOrder: 10
};

export const query = `
  query Query {
    api: url(routeId: "salestatistic")    
  }
`;
