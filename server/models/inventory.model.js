const mongoose = require('mongoose');
const InventorySchema = new mongoose.Schema({
  name: String, // e.g., "Cricket Bat"
  category: String, // e.g., "Sports"
  totalQuantity: Number,
  availableQuantity: Number,
});
module.exports = mongoose.model('Inventory', InventorySchema);