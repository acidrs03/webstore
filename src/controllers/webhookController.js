'use strict';

const stripeService = require('../services/stripeService');
const orderService = require('../services/orderService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, sig);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Idempotency — avoid duplicate order creation
        const existing = await orderService.getOrderByStripeSessionId(session.id);
        if (existing) {
          logger.info(`Order already exists for session ${session.id}`);
          break;
        }

        const order = await orderService.createOrderFromStripeSession(session);
        await emailService.sendOrderConfirmation({ order });
        await emailService.sendAdminNewOrder({ order });
        logger.info(`Order created: ${order.orderNumber}`);
        break;
      }

      case 'checkout.session.expired':
        logger.info(`Checkout session expired: ${event.data.object.id}`);
        break;

      case 'payment_intent.payment_failed':
        logger.warn(`Payment failed: ${event.data.object.id}`);
        break;

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
