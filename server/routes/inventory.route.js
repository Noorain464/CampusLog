const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// Public route - anyone can view inventory
router.get('/inventory', inventoryController.getAllItems);
router.get('/inventory/:id', inventoryController.getItemById);

// Admin only routes
router.post('/inventory', authenticate, authorizeAdmin, inventoryController.addItem);
router.put('/inventory/:id', authenticate, authorizeAdmin, inventoryController.updateItem);
router.delete('/inventory/:id', authenticate, authorizeAdmin, inventoryController.deleteItem);

module.exports = router;