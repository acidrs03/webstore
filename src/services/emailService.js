'use strict';

const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Email Service — Log-Only (MVP stub)
//
// In production, replace the logger calls with a real mail provider:
//
//   Option A — Nodemailer + SMTP (e.g. Gmail, Mailgun SMTP):
//     const nodemailer = require('nodemailer');
//     const transporter = nodemailer.createTransport({ ... });
//     await transporter.sendMail({ from, to, subject, html });
//
//   Option B — SendGrid:
//     const sgMail = require('@sendgrid/mail');
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     await sgMail.send({ to, from, subject, html });
//
//   Option C — Postmark, Resend, AWS SES, etc. — same pattern.
//
// Keep the function signatures identical so routes/services that call them
// never need to change.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send an order confirmation email to the customer.
 *
 * @param {object} options
 * @param {object} options.order - The saved order document
 * @returns {Promise<boolean>}
 */
async function sendOrderConfirmation({ order }) {
  logger.info('[emailService] Order confirmation email (stub)', {
    orderNumber: order.orderNumber,
    customerEmail: order.customer?.email,
    customerName: order.customer?.name,
    total: order.total,
    itemCount: order.items?.length,
  });

  // TODO: Replace with real email delivery
  // Example:
  // await transporter.sendMail({
  //   from: `${process.env.SITE_NAME || 'My Store'}} <${process.env.EMAIL_FROM}>`,
  //   to: order.customer.email,
  //   subject: `Order Confirmation — ${order.orderNumber}`,
  //   html: renderOrderConfirmationTemplate(order),
  // });

  return true;
}

/**
 * Send a notification email when a custom request is submitted.
 *
 * @param {object} options
 * @param {object} options.customRequest - The saved CustomRequest document
 * @returns {Promise<boolean>}
 */
async function sendCustomRequestReceived({ customRequest }) {
  logger.info('[emailService] Custom request received email (stub)', {
    requestId: customRequest._id,
    name: customRequest.name,
    email: customRequest.email,
    productInterest: customRequest.productInterest,
  });

  // TODO: Replace with real email delivery
  // Send to both the customer (acknowledgement) and the admin (notification).
  // Example:
  // await transporter.sendMail({
  //   from: `${process.env.SITE_NAME || 'My Store'}} <${process.env.EMAIL_FROM}>`,
  //   to: customRequest.email,
  //   subject: 'We received your custom request!',
  //   html: renderCustomRequestTemplate(customRequest),
  // });

  return true;
}

/**
 * Notify the store admin of a new paid order.
 *
 * @param {object} options
 * @param {object} options.order - The saved order document
 * @returns {Promise<boolean>}
 */
async function sendAdminNewOrder({ order }) {
  logger.info('[emailService] Admin new order notification (stub)', {
    orderNumber: order.orderNumber,
    customerEmail: order.customer?.email,
    total: order.total,
    fulfillmentStatus: order.fulfillmentStatus,
  });

  // TODO: Replace with real email delivery
  // Example:
  // await transporter.sendMail({
  //   from: `${process.env.SITE_NAME || 'My Store'}} System <${process.env.EMAIL_FROM}>`,
  //   to: process.env.ADMIN_EMAIL,
  //   subject: `New Order — ${order.orderNumber}`,
  //   html: renderAdminOrderTemplate(order),
  // });

  return true;
}

module.exports = {
  sendOrderConfirmation,
  sendCustomRequestReceived,
  sendAdminNewOrder,
};
