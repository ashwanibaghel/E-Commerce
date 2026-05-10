import { Card, CardContent, CardHeader } from '@components/common/ui/Card.js';
import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

type DemoOrderForAction = {
  demoOrderStatusApi: string;
  shipmentStatus?: {
    code: string;
    name: string;
  };
  paymentStatus?: {
    code: string;
    name: string;
  };
};

const getNextAction = (order: DemoOrderForAction) => {
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
      help: 'First confirm or reject this order.',
      actions: [
        { code: 'confirm', label: 'Confirm Order' },
        { code: 'reject', label: 'Reject Order' }
      ]
    };
  }

  if (payment === 'pending') {
    return {
      type: 'button',
      code: 'paid',
      label: 'Mark COD Paid',
      help: 'Cash collection is pending.'
    };
  }

  if (shipment === 'processing') {
    return {
      type: 'button',
      code: 'ship',
      label: 'Mark Shipped',
      help: 'Create demo dispatch and tracking.'
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

interface DemoStatusActionsProps {
  order: DemoOrderForAction;
}

export default function DemoStatusActions({ order }: DemoStatusActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const nextAction = getNextAction(order);

  const runAction = async (actionCode?: string) => {
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
      toast.error(response.data.error.message);
      setLoadingAction(null);
      return;
    }
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <h3>Order Controls</h3>
          <p className="text-textSubdued">
            Confirm, collect COD, ship or reject this order for the demo flow.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="baghel-admin-order-status-summary">
          <span>Shipment: {order.shipmentStatus?.name || 'Pending'}</span>
          <span>Payment: {order.paymentStatus?.name || 'Pending'}</span>
        </div>
        <div className="baghel-admin-order-control-list">
          {nextAction.type === 'done' && (
            <div className="baghel-admin-order-control-list__empty">
              <strong>{nextAction.label}</strong>
              <span>{nextAction.help}</span>
            </div>
          )}
          {nextAction.type === 'menu' && (
            <label className="baghel-admin-order-control-list__select">
              <strong>{nextAction.label}</strong>
              <select
                value=""
                disabled={Boolean(loadingAction)}
                onChange={(event) => runAction(event.target.value)}
              >
                <option value="">
                  {loadingAction ? 'Saving...' : 'Choose action'}
                </option>
                {nextAction.actions.map((action) => (
                  <option key={action.code} value={action.code}>
                    {action.label}
                  </option>
                ))}
              </select>
              <span>{nextAction.help}</span>
            </label>
          )}
          {nextAction.type === 'button' && (
            <button
              type="button"
              disabled={Boolean(loadingAction)}
              onClick={() => runAction(nextAction.code)}
            >
              <strong>
                {loadingAction === nextAction.code
                  ? 'Saving...'
                  : nextAction.label}
              </strong>
              <span>{nextAction.help}</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'rightSide',
  sortOrder: 2
};

export const query = `
  query Query {
    order(uuid: getContextValue("orderId")) {
      demoOrderStatusApi
      shipmentStatus {
        code
        name
      }
      paymentStatus {
        code
        name
      }
    }
  }
`;
