const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { category, day, type, available } = req.query;
    let query = {};

    if (category) query.category = category;
    if (day) query.day = { $in: [day, 'All'] };
    if (type) query.type = type;
    if (available) query.available = available === 'true';

    const menuItems = await Menu.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: menuItems.length, data: menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private (Kitchen, Admin)
const createMenuItem = async (req, res) => {
  try {
    const { title, description, price, category, day, type, available, image } = req.body;

    const menuItem = await Menu.create({
      title,
      description,
      price,
      category,
      day: day || 'All',
      type: type || 'Veg',
      available: available !== undefined ? available : true,
      image: image || ''
    });

    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Create Menu Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private (Kitchen, Admin)
const updateMenuItem = async (req, res) => {
  try {
    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private (Kitchen, Admin)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    await menuItem.deleteOne();
    res.json({ success: true, message: 'Menu item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
