const Transaction = require('../models/transaction.model');
const Inventory = require('../models/inventory.model');
const { sendPushNotification } = require('../utils/push');
const User = require('../models/user.model');

// Student: Request Item
exports.requestItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user._id;

    // Check if item exists and is available
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (item.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Item is currently out of stock'
      });
    }

    // Check if user already has a pending or approved request for this item
    const existingRequest = await Transaction.findOne({
      user: userId,
      item: itemId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request for this item'
      });
    }

    const newTx = new Transaction({
      user: userId,
      item: itemId,
      status: 'pending'
    });
    await newTx.save();

    // Populate the transaction for response
    await newTx.populate('user', 'name email');
    await newTx.populate('item', 'name category');

    // TODO: Trigger Push Notification to Admin here
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      if (admin.pushToken) {
        await sendPushNotification(
          admin.pushToken,
          'New Request',
          `${req.user.name} requested ${item.name}`,
          { transactionId: newTx._id }
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Request sent successfully!',
      transaction: newTx
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get user's own transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.find({ user: userId })
      .populate('item', 'name category')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Get All Requests (with filters)
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const requests = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('item', 'name category')
      .sort({ requestDate: -1 });

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Get Pending Requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Transaction.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('item', 'name category')
      .sort({ requestDate: 1 });

    res.json({
      success: true,
      requests
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Approve Request
exports.approveRequest = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const tx = await Transaction.findById(transactionId)
      .populate('item');

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Transaction is already ${tx.status}`
      });
    }

    // Check if item is still available
    const item = await Inventory.findById(tx.item._id);
    if (item.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Item is no longer available'
      });
    }

    // Update transaction status
    tx.status = 'approved';
    await tx.save();

    // Decrease inventory available quantity
    item.availableQuantity -= 1;
    await item.save();

    // Populate for response
    await tx.populate('user', 'name email');
    await tx.populate('item', 'name category');

    // TODO: Trigger Push Notification to Student here
    if (tx.user && tx.user.pushToken) {
      await sendPushNotification(
        tx.user.pushToken,
        'Request Approved',
        `Your request for ${item.name} has been approved!`,
        { transactionId: tx._id }
      );
    }

    res.json({
      success: true,
      message: 'Request approved successfully',
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: Reject Request
exports.rejectRequest = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const tx = await Transaction.findById(transactionId);
    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (tx.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Transaction is already ${tx.status}`
      });
    }

    tx.status = 'rejected';
    await tx.save();

    await tx.populate('user', 'name email');
    await tx.populate('item', 'name category');

    res.json({
      success: true,
      message: 'Request rejected',
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Student/Admin: Return Item
exports.returnItem = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const tx = await Transaction.findById(transactionId)
      .populate('item');

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user owns this transaction or is admin
    if (!isAdmin && tx.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only return your own items'
      });
    }

    if (tx.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved items can be returned'
      });
    }

    // Update transaction status
    tx.status = 'returned';
    tx.returnDate = new Date();
    await tx.save();

    // Increase inventory available quantity
    const item = await Inventory.findById(tx.item._id);
    item.availableQuantity += 1;
    await item.save();

    await tx.populate('user', 'name email');
    await tx.populate('item', 'name category');

    res.json({
      success: true,
      message: 'Item returned successfully',
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};