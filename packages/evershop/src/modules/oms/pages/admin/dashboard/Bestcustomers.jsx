import { useAppState } from '@components/common/context/app';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/common/ui/Table.js';
import PropTypes from 'prop-types';
import React from 'react';
import { UserRoundSearch } from 'lucide-react';

export default function BestCustomers({ listUrl, setting }) {
  const context = useAppState();
  const customers = context.bestCustomers || [];

  return (
    <Card className="baghel-admin-card baghel-admin-list-card">
      <CardHeader>
        <CardTitle>Customer Snapshot</CardTitle>
        <CardDescription>
          Buyers with the most orders will appear here
        </CardDescription>
        <CardAction>
          <a href={listUrl} className="text-sm text-primary hover:underline">
            Manage customers
          </a>
        </CardAction>
      </CardHeader>
      <CardContent>
        {customers.length === 0 && (
          <div className="baghel-admin-empty">
            <UserRoundSearch size={22} />
            <div>
              <strong>No customers yet</strong>
              <span>Customer history will become useful after the first few orders.</span>
            </div>
          </div>
        )}
        {customers.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full name</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c, i) => {
                const grandTotal = new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: setting.storeCurrency || 'INR'
                }).format(c.total);
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <a href={c.editUrl || ''}>{c.full_name}</a>
                    </TableCell>
                    <TableCell>{c.orders}</TableCell>
                    <TableCell>{grandTotal}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

BestCustomers.propTypes = {
  setting: PropTypes.shape({
    storeCurrency: PropTypes.string
  }).isRequired,
  listUrl: PropTypes.string.isRequired
};

export const query = `
  query Query {
    setting {
      storeCurrency
    }
    listUrl: url(routeId: "customerGrid")
  }
`;
