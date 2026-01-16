const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// Student routes - require authentication
router.post('/request', authenticate, transactionController.requestItem);
router.get('/transactions/my', authenticate, transactionController.getMyTransactions);

// Admin routes - require authentication and admin role
router.get('/requests', authenticate, authorizeAdmin, transactionController.getAllRequests);
router.get('/requests/pending', authenticate, authorizeAdmin, transactionController.getPendingRequests);
router.post('/request/approve', authenticate, authorizeAdmin, transactionController.approveRequest);
router.post('/request/reject', authenticate, authorizeAdmin, transactionController.rejectRequest);

// Return item - both students and admins can return
router.post('/request/return', authenticate, transactionController.returnItem);

module.exports = router;