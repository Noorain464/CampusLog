const Inventory = require('../models/inventory.model');

// Get All Items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json({ 
      success: true, 
      items 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get Single Item
exports.getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    res.json({ 
      success: true, 
      item 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add Item (For Admin/Seeding)
exports.addItem = async (req, res) => {
  try {
  const { name, category, totalQuantity, availableQuantity } = req.body;
  
  // Set availableQuantity to totalQuantity if not provided
  const availQty = availableQuantity !== undefined ? availableQuantity : totalQuantity;
  
  const newItem = new Inventory({ 
    name, 
    category, 
    totalQuantity, 
    availableQuantity: availQty 
  });
  await newItem.save();
  
    res.status(201).json({ 
      success: true, 
      item: newItem 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Item (For Admin)
exports.updateItem = async (req, res) => {
  try {
  const item = await Inventory.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ 
      success: false, 
      message: 'Item not found' 
    });
  }
  
  const { name, category, totalQuantity, availableQuantity } = req.body;
  if (name) item.name = name;
  if (category) item.category = category;
  if (totalQuantity !== undefined) item.totalQuantity = totalQuantity;
  if (availableQuantity !== undefined) item.availableQuantity = availableQuantity;
  
  await item.save();
    res.json({ 
      success: true, 
      item 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Item (For Admin)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Item deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};