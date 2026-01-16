const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'returned'], 
    default: 'pending' 
  },
  requestDate: { type: Date, default: Date.now },
  returnDate: Date,
});
module.exports = mongoose.model('Transaction', TransactionSchema);