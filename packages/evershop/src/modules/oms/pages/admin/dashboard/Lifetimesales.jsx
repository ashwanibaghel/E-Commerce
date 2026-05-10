import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import PropTypes from 'prop-types';
import React from 'react';
import { toast } from 'react-toastify';
import './Lifetimesales.scss';
import { CheckCircle2, IndianRupee, PackageCheck, XCircle } from 'lucide-react';

export default function LifetimeSale({ api }) {
  const [data, setData] = React.useState({});
  const [fetching, setFetching] = React.useState(true);
  const { orders, total, completed_percentage, cancelled_percentage } = data;

  React.useEffect(() => {
    if (window !== undefined) {
      fetch(api, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((json) => {
          setData(json && typeof json === 'object' ? json : {});
          setFetching(false);
        })
        .catch((error) => {
          toast.error(error.message);
          setData({});
          setFetching(false);
        });
    }
  }, []);

  if (fetching) {
    return (
      <Card title="Lifetime Sales">
        <CardHeader>
          <CardTitle>Lifetime Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="skeleton-wrapper-lifetime">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </CardContent>
        <CardContent>
          <div className="skeleton-wrapper-lifetime">
            <div className="skeleton-chart" />
          </div>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card className="baghel-admin-card baghel-admin-lifetime" title="Store Health">
        <CardHeader>
          <CardTitle>Store Health</CardTitle>
          <CardDescription>Simple numbers your client can understand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="baghel-admin-health-list">
            <div>
              <PackageCheck size={18} />
              <span>Total orders</span>
              <strong>{orders || 0}</strong>
            </div>
            <div>
              <IndianRupee size={18} />
              <span>Lifetime sale</span>
              <strong>{total || '₹0.00'}</strong>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Completed</span>
              <strong>{completed_percentage || 0}%</strong>
            </div>
            <div>
              <XCircle size={18} />
              <span>Cancelled</span>
              <strong>{cancelled_percentage || 0}%</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

LifetimeSale.propTypes = {
  api: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'rightSide',
  sortOrder: 10
};

export const query = `
  query Query {
    api: url(routeId: "lifetimesales")    
  }
`;
