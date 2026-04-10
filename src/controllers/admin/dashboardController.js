'use strict';

const orderService = require('../../services/orderService');
const customRequestService = require('../../services/customRequestService');
const productService = require('../../services/productService');

exports.index = async (req, res, next) => {
  try {
    const [orderStats, requestStats, recentOrdersResult] = await Promise.all([
      orderService.getDashboardStats(),
      customRequestService.getStats(),
      orderService.getOrders({ page: 1, limit: 5 }),
    ]);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      orderStats,
      requestStats,
      recentOrders: recentOrdersResult.orders,
    });
  } catch (err) {
    next(err);
  }
};
