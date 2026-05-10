import { insert, select } from '@evershop/postgres-query-builder';
import { pool } from '../../../../lib/postgres/connection.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import addOrderActivityLog from '../../services/addOrderActivityLog.js';
import cancelOrder from '../../services/cancelOrder.js';
import createShipment from '../../services/createShipment.js';
import { updatePaymentStatus } from '../../services/updatePaymentStatus.js';
import { updateShipmentStatus } from '../../services/updateShipmentStatus.js';

const ACTION_LABELS = {
  confirm: 'Order confirmed',
  paid: 'COD payment marked paid',
  ship: 'Order shipped',
  deliver: 'Order delivered',
  reject: 'Order rejected'
};

export default async (request, response, next) => {
  const id = Array.isArray(request.params.id)
    ? request.params.id[0]
    : request.params.id;
  const action = request.body?.action;
  const note = request.body?.note || ACTION_LABELS[action] || 'Order updated';

  try {
    const order = await select()
      .from('order')
      .where('uuid', '=', id)
      .load(pool, false);

    if (!order || !ACTION_LABELS[action]) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid order or action'
        }
      });
      return;
    }

    if (action === 'confirm') {
      await updateShipmentStatus(order.order_id, 'processing', pool);
      await addOrderActivityLog(order.order_id, note, true, pool);
    }

    if (action === 'paid') {
      await updatePaymentStatus(order.order_id, 'paid', pool);
      await insert('payment_transaction')
        .given({
          payment_transaction_order_id: order.order_id,
          amount: order.grand_total,
          currency: order.currency,
          payment_action: 'capture',
          transaction_type: 'offline'
        })
        .execute(pool);
      await addOrderActivityLog(order.order_id, note, true, pool);
    }

    if (action === 'ship' || action === 'deliver') {
      const shipment = await select()
        .from('shipment')
        .where('shipment_order_id', '=', order.order_id)
        .load(pool, false);
      if (!shipment) {
        await createShipment(order.uuid, 'default', `BD-${order.order_number}`);
      } else if (action === 'ship') {
        await updateShipmentStatus(order.order_id, 'shipped', pool);
      }
      if (action === 'deliver') {
        await updateShipmentStatus(order.order_id, 'delivered', pool);
      }
      await addOrderActivityLog(order.order_id, note, true, pool);
    }

    if (action === 'reject') {
      await cancelOrder(order.uuid, note);
    }

    response.status(OK);
    response.json({
      data: {
        action,
        message: ACTION_LABELS[action]
      }
    });
  } catch (e) {
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: e.message
      }
    });
  }
};
