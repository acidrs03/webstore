'use strict';

const customRequestService = require('../../services/customRequestService');

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { status } = req.query;
    const result = await customRequestService.getRequests({ page, limit: 20, status });
    res.render('admin/custom-requests/index', {
      title: 'Custom Requests',
      requests: result.requests,
      pagination: result.pagination,
      filters: req.query,
    });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const request = await customRequestService.getRequestById(req.params.id);
    if (!request) {
      req.flash('error', 'Request not found.');
      return res.redirect('/admin/custom-requests');
    }
    res.render('admin/custom-requests/detail', {
      title: `Request from ${request.name}`,
      request,
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    await customRequestService.updateStatus(req.params.id, status, adminNotes);
    req.flash('success', 'Request updated.');
    res.redirect(`/admin/custom-requests/${req.params.id}`);
  } catch (err) {
    next(err);
  }
};
