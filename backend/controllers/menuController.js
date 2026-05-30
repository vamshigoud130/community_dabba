const Menu = require('../models/Menu');
const cloudinary = require('../config/cloudinary');

/**
 * Upload image buffer to Cloudinary
 * Returns the secure URL of the uploaded image
 */
const uploadToCloudinary = (fileBuffer, folder = 'community_dabba/dishes') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

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

    let imageUrl = image || '';

    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer);
      } catch (uploadErr) {
        console.error('Cloudinary Upload Error:', uploadErr);
        return res.status(400).json({ success: false, message: 'Image upload failed: ' + uploadErr.message });
      }
    }

    const menuItem = await Menu.create({
      title,
      description: description || '',
      price: Number(price),
      category,
      day: day || 'All',
      type: type || 'Veg',
      available: available !== undefined ? (available === 'true' || available === true) : true,
      image: imageUrl
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

    // If a new file was uploaded, upload it to Cloudinary
    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer);
        req.body.image = imageUrl;
      } catch (uploadErr) {
        console.error('Cloudinary Upload Error:', uploadErr);
        return res.status(400).json({ success: false, message: 'Image upload failed: ' + uploadErr.message });
      }
    }

    // Handle 'available' field coming as string from FormData
    if (req.body.available !== undefined) {
      req.body.available = req.body.available === 'true' || req.body.available === true;
    }

    // Handle 'price' field coming as string from FormData
    if (req.body.price !== undefined) {
      req.body.price = Number(req.body.price);
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
