import { GridPagination } from '@components/admin/grid/GridPagination';
import Area from '@components/common/Area';
import { Form } from '@components/common/form/Form.js';
import { InputField } from '@components/common/form/InputField.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Card,
  CardContent,
  CardHeader,
  CardAction
} from '@components/common/ui/Card.js';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@components/common/ui/Select.js';
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const getNextActions = (order) => {
  const shipment = order.shipmentStatus?.code;
  const payment = order.paymentStatus?.code;

  if (shipment === 'canceled' || payment === 'canceled') {
    return {
      type: 'done',
      label: 'Rejected',
      help: 'This order has been canceled.'
    };
  }

  if (shipment === 'delivered') {
    return {
      type: 'done',
      label: 'Delivered',
      help: 'No pending action for this order.'
    };
  }

  if (shipment === 'pending') {
    return {
      type: 'menu',
      label: 'Review Order',
      help: 'Confirm or reject this new order.',
      actions: [
        { code: 'confirm', label: 'Confirm Order' },
        { code: 'reject', label: 'Reject Order', danger: true }
      ]
    };
  }

  if (payment === 'pending') {
    return {
      type: 'button',
      code: 'paid',
      label: 'Mark COD Paid',
      help: 'Cash collection pending.'
    };
  }

  if (shipment === 'processing') {
    return {
      type: 'button',
      code: 'ship',
      label: 'Mark Shipped',
      help: 'Prepare dispatch and create demo tracking.'
    };
  }

  if (shipment === 'shipped') {
    return {
      type: 'button',
      code: 'deliver',
      label: 'Mark Delivered',
      help: 'Close delivery after handover.'
    };
  }

  return {
    type: 'done',
    label: 'Updated',
    help: 'No pending action for this order.'
  };
};

function StatusBadge({ status }) {
  return (
    <span
      className={[
        'baghel-admin-order-card__status',
        `is-${status?.code || 'pending'}`
      ].join(' ')}
    >
      {status?.name || 'Pending'}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string
  })
};

function OrderActionControl({ order }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const next = getNextActions(order);

  const runAction = async (actionCode) => {
    if (!actionCode) {
      return;
    }
    if (
      actionCode === 'reject' &&
      !window.confirm('Reject this order? Customer will see it as canceled.')
    ) {
      return;
    }

    setLoadingAction(actionCode);
    const response = await axios.post(
      order.demoOrderStatusApi,
      {
        action: actionCode,
        note:
          actionCode === 'reject'
            ? 'Order rejected by Baghel Digital'
            : undefined
      },
      { validateStatus: false }
    );

    if (response.data?.error) {
      alert(response.data.error.message);
      setLoadingAction(null);
      return;
    }
    window.location.reload();
  };

  if (next.type === 'done') {
    return (
      <div className="baghel-admin-order-card__action is-done">
        <strong>{next.label}</strong>
        <span>{next.help}</span>
      </div>
    );
  }

  if (next.type === 'menu') {
    return (
      <div className="baghel-admin-order-card__action">
        <label>{next.label}</label>
        <select
          value=""
          disabled={Boolean(loadingAction)}
          onChange={(event) => runAction(event.target.value)}
        >
          <option value="">
            {loadingAction ? 'Saving...' : 'Choose action'}
          </option>
          {next.actions.map((action) => (
            <option key={action.code} value={action.code}>
              {action.label}
            </option>
          ))}
        </select>
        <span>{next.help}</span>
      </div>
    );
  }

  return (
    <div className="baghel-admin-order-card__action">
      <button
        type="button"
        disabled={Boolean(loadingAction)}
        onClick={() => runAction(next.code)}
      >
        {loadingAction ? 'Saving...' : next.label}
      </button>
      <span>{next.help}</span>
    </div>
  );
}

OrderActionControl.propTypes = {
  order: PropTypes.shape({
    demoOrderStatusApi: PropTypes.string.isRequired,
    shipmentStatus: PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string
    }),
    paymentStatus: PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string
    })
  }).isRequired
};

function OrderCard({ order }) {
  return (
    <article className="baghel-admin-order-card">
      <div className="baghel-admin-order-card__top">
        <div>
          <span className="baghel-admin-order-card__eyebrow">Order</span>
          <a href={order.editUrl} className="baghel-admin-order-card__number">
            #{order.orderNumber}
          </a>
        </div>
        <div className="baghel-admin-order-card__total">
          <span>Total</span>
          <strong>{order.grandTotal.text}</strong>
        </div>
      </div>

      <div className="baghel-admin-order-card__body">
        <div className="baghel-admin-order-card__info">
          <span>Customer</span>
          <strong>{order.customerEmail}</strong>
        </div>
        <div className="baghel-admin-order-card__info">
          <span>Date</span>
          <strong>{order.createdAt.text}</strong>
        </div>
      </div>

      <div className="baghel-admin-order-card__status-grid">
        <div>
          <span>Shipment</span>
          <StatusBadge status={order.shipmentStatus} />
        </div>
        <div>
          <span>Payment</span>
          <StatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="baghel-admin-order-card__footer">
        <OrderActionControl order={order} />
        <a href={order.editUrl} className="baghel-admin-order-card__details">
          View details
        </a>
      </div>
    </article>
  );
}

OrderCard.propTypes = {
  order: PropTypes.shape({
    orderNumber: PropTypes.string.isRequired,
    createdAt: PropTypes.shape({
      text: PropTypes.string.isRequired
    }).isRequired,
    customerEmail: PropTypes.string.isRequired,
    shipmentStatus: PropTypes.shape({
      name: PropTypes.string,
      code: PropTypes.string
    }),
    paymentStatus: PropTypes.shape({
      name: PropTypes.string,
      code: PropTypes.string
    }),
    grandTotal: PropTypes.shape({
      text: PropTypes.string.isRequired
    }).isRequired,
    editUrl: PropTypes.string.isRequired,
    demoOrderStatusApi: PropTypes.string.isRequired
  }).isRequired
};

export default function OrderGrid({
  orders: { items: orders, total, currentFilters = [] },
  paymentStatusList,
  shipmentStatusList
}) {
  const page = currentFilters.find((filter) => filter.key === 'page')
    ? parseInt(currentFilters.find((filter) => filter.key === 'page').value, 10)
    : 1;

  const limit = currentFilters.find((filter) => filter.key === 'limit')
    ? parseInt(
        currentFilters.find((filter) => filter.key === 'limit').value,
        10
      )
    : 20;

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <Form submitBtn={false} id="orderGridFilter">
          <div className="flex gap-5 justify-center items-center">
            <Area
              id="orderGridFilter"
              noOuter
              coreComponents={[
                {
                  component: {
                    default: () => (
                      <InputField
                        name="keyword"
                        placeholder="Search"
                        defaultValue={
                          currentFilters.find((f) => f.key === 'keyword')?.value
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const url = new URL(document.location);
                            const keyword = e.target?.value;
                            if (keyword) {
                              url.searchParams.set('keyword', keyword);
                            } else {
                              url.searchParams.delete('keyword');
                            }
                            window.location.href = url;
                          }
                        }}
                      />
                    )
                  },
                  sortOrder: 5
                },
                {
                  component: {
                    default: () => (
                      <Select
                        value={
                          currentFilters.find(
                            (f) => f.key === 'payment_status'
                          )
                            ? currentFilters.find(
                                (f) => f.key === 'payment_status'
                              ).value
                            : undefined
                        }
                        onValueChange={(value) => {
                          const url = new URL(document.location);
                          url.searchParams.set('payment_status', value);
                          window.location.href = url;
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>Payment Status</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Payment Status</SelectLabel>
                            {paymentStatusList.map((status, index) => (
                              <SelectItem key={index} value={status.code}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )
                  },
                  sortOrder: 10
                },
                {
                  component: {
                    default: () => (
                      <Select
                        value={
                          currentFilters.find(
                            (f) => f.key === 'shipment_status'
                          )
                            ? currentFilters.find(
                                (f) => f.key === 'shipment_status'
                              ).value
                            : undefined
                        }
                        onValueChange={(value) => {
                          const url = new URL(document.location);
                          url.searchParams.set('shipment_status', value);
                          window.location.href = url;
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>Shipment Status</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Shipment Status</SelectLabel>
                            {shipmentStatusList.map((status, index) => (
                              <SelectItem key={index} value={status.code}>
                                {status.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )
                  },
                  sortOrder: 15
                }
              ]}
              currentFilters={currentFilters}
            />
          </div>
        </Form>
        <CardAction>
          <Button
            variant="link"
            className={'hover:cursor-pointer'}
            onClick={() => {
              const url = new URL(document.location);
              url.search = '';
              window.location.href = url.href;
            }}
          >
            Clear Filters
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="baghel-admin-order-board">
          {orders.map((order) => (
            <OrderCard order={order} key={order.orderId} />
          ))}
        </div>
        {orders.length === 0 && (
          <div className="flex w-full justify-center">
            There is no order to display
          </div>
        )}
        <GridPagination total={total} limit={limit} page={page} />
      </CardContent>
    </Card>
  );
}

OrderGrid.propTypes = {
  orders: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        orderId: PropTypes.string.isRequired,
        orderNumber: PropTypes.string.isRequired,
        createdAt: PropTypes.shape({
          value: PropTypes.string.isRequired,
          text: PropTypes.string.isRequired
        }).isRequired,
        customerEmail: PropTypes.string.isRequired,
        shipmentStatus: PropTypes.shape({
          name: PropTypes.string.isRequired,
          code: PropTypes.string.isRequired,
          badge: PropTypes.string.isRequired
        }).isRequired,
        paymentStatus: PropTypes.shape({
          name: PropTypes.string.isRequired,
          code: PropTypes.string.isRequired,
          badge: PropTypes.string.isRequired
        }).isRequired,
        grandTotal: PropTypes.shape({
          value: PropTypes.number.isRequired,
          text: PropTypes.string.isRequired
        }).isRequired,
        editUrl: PropTypes.string.isRequired,
        demoOrderStatusApi: PropTypes.string.isRequired
      })
    ).isRequired,
    total: PropTypes.number.isRequired,
    currentFilters: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        operation: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  paymentStatusList: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  shipmentStatusList: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 20
};

export const query = `
  query Query($filters: [FilterInput]) {
    orders (filters: $filters) {
      items {
        orderId
        uuid
        orderNumber
        createdAt {
          value
          text
        }
        customerEmail
        shipmentStatus {
          name
          code
          badge
        }
        paymentStatus {
          name
          code
          badge
        }
        grandTotal {
          value
          text
        }
        editUrl
        demoOrderStatusApi
      }
      total
      currentFilters {
        key
        operation
        value
      }
    }
    paymentStatusList {
      code
      name
    }
    shipmentStatusList {
      code
      name
    }
  }
`;

export const variables = `
{
  filters: getContextValue('filtersFromUrl')
}`;
