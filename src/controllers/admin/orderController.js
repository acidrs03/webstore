'use strict';

const orderService = require('../../services/orderService');
const { formatCurrency } = require('../../utils/formatCurrency');

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { paymentStatus, fulfillmentStatus, search } = req.query;
    const result = await orderService.getOrders({ page, limit: 20, paymentStatus, fulfillmentStatus, search });
    res.render('admin/orders/index', {
      title: 'Orders',
      orders: result.orders,
      pagination: result.pagination,
      filters: req.query,
      formatCurrency,
    });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      req.flash('error', 'Order not found.');
      return res.redirect('/admin/orders');
    }
    res.render('admin/orders/detail', {
      title: `Order ${order.orderNumber}`,
      order,
      formatCurrency,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateFulfillment = async (req, res, next) => {
  try {
    const { fulfillmentStatus, trackingNumber } = req.body;
    await orderService.updateFulfillmentStatus(req.params.id, fulfillmentStatus, trackingNumber);
    req.flash('success', 'Fulfillment status updated.');
    res.redirect(`/admin/orders/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};

exports.updateNotes = async (req, res, next) => {
  try {
    await orderService.updateAdminNotes(req.params.id, req.body.adminNotes || '');
    req.flash('success', 'Notes saved.');
    res.redirect(`/admin/orders/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};
