import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import React from 'react';
import './Bestsellers.scss';
import { Image } from '@components/common/Image.js';
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail.js';
import { PackageSearch } from 'lucide-react';
import {
  Table,
  TableRow,
  TableBody,
  TableCell
} from '@components/common/ui/Table.js';

interface BestSellersProps {
  bestSellers: Array<{
    name: string;
    price: {
      regular: {
        value: number;
        text: string;
      };
    };
    soldQty: number;
    image?: {
      url?: string;
    };
    editUrl?: string;
  }>;
  listUrl: string;
}

export default function BestSellers({
  bestSellers,
  listUrl
}: BestSellersProps) {
  const products = Array.isArray(bestSellers) ? bestSellers : [];

  return (
    <Card className="baghel-admin-card baghel-admin-list-card">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>
          Products that need attention from sales
        </CardDescription>
        <CardAction>
          <a href={listUrl} className="text-sm text-primary hover:underline">
            Manage products
          </a>
        </CardAction>
      </CardHeader>
      <CardContent>
        {products.length === 0 && (
          <div className="baghel-admin-empty">
            <PackageSearch size={22} />
            <div>
              <strong>No sales yet</strong>
              <span>Once orders start coming in, top electronics will show here.</span>
            </div>
          </div>
        )}
        {products.length > 0 && (
          <Table>
            <TableBody>
              {products.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex justify-left">
                      <div className="flex justify-start gap-2 items-center">
                        <div className="grid-thumbnail text-border border border-divider p-2 rounded">
                          {p.image?.url && (
                            <Image
                              src={p.image.url}
                              alt={p.name}
                              width={50}
                              height={50}
                            />
                          )}
                          {!p.image?.url && (
                            <ProductNoThumbnail width={50} height={50} />
                          )}
                        </div>
                        <div>
                          <a
                            href={p.editUrl || ''}
                            className="font-semibold hover:underline"
                          >
                            {p.name}
                          </a>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell />
                  <TableCell>{p.price?.regular?.text || '₹0.00'}</TableCell>
                  <TableCell>{p.soldQty || 0} sold</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'leftSide',
  sortOrder: 20
};

export const query = `
  query Query {
    bestSellers {
      name
      price {
        regular {
          value
          text
        }
      }
      soldQty
      image {
        url
      }
      editUrl
    }
    listUrl: url(routeId: "productGrid")
  }
`;
