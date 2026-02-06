const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery-app')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Error:', err));

// Models
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  video: { type: String },
  category: { type: String, default: 'General' },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// NEW: Shipping Settings Schema
const shippingSettingsSchema = new mongoose.Schema({
  shippingFee: { type: Number, default: 0 },
  freeShippingThreshold: { type: Number, default: 0 },
  shippingEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

const websiteSettingsSchema = new mongoose.Schema({
  name: { type: String, default: "ELBAALBAKI ELECTRIC" }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Admin = mongoose.model('Admin', adminSchema);
const ShippingSettings = mongoose.model('ShippingSettings', shippingSettingsSchema);
const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Routes

// Auth Routes
app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/search', async (req, res) => {
  try {
    const { q } = req.query; // q is the search query
    
    if (!q || q.trim() === '') {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json(products);
    }
    
    const searchQuery = q.trim();
    
    const products = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      inStock: inStock === 'true',
      image: req.files.image ? `/uploads/${req.files.image[0].filename}` : '',
      video: req.files.video ? `/uploads/${req.files.video[0].filename}` : ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      category,
      inStock: inStock === 'true'
    };

    if (req.files.image) {
      updateData.image = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files.video) {
      updateData.video = `/uploads/${req.files.video[0].filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order Routes
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items, totalAmount, shippingFee, notes } = req.body;
    
    const orderNumber = 'ORD-' + Date.now();
    
    const order = new Order({
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount,
      shippingFee: shippingFee || 0,
      notes
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NEW: Shipping Settings Routes
app.get('/api/shipping-settings', async (req, res) => {
  try {
    let settings = await ShippingSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new ShippingSettings({
        shippingFee: 0,
        freeShippingThreshold: 0,
        shippingEnabled: true
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/shipping-settings', authMiddleware, async (req, res) => {
  try {
    const { shippingFee, freeShippingThreshold, shippingEnabled } = req.body;
    
    let settings = await ShippingSettings.findOne();
    
    if (!settings) {
      settings = new ShippingSettings();
    }
    
    settings.shippingFee = parseFloat(shippingFee) || 0;
    settings.freeShippingThreshold = parseFloat(freeShippingThreshold) || 0;
    settings.shippingEnabled = shippingEnabled !== undefined ? shippingEnabled : true;
    settings.updatedAt = Date.now();
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Website Settings Routes
app.get('/api/website-settings', async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/website-settings', authMiddleware, async (req, res) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings();
    }
    settings.name = req.body.name;
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Settings Routes
app.get('/api/settings', authMiddleware, async (req, res) => {
  try {
    // You can expand this to store WhatsApp number and other settings in DB
    res.json({ 
      whatsappNumber: process.env.WHATSAPP_NUMBER || '78922256',
      storeName: process.env.STORE_NAME || 'My Store'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite Routes
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ userId }).populate('productId');
    res.json(favorites.map(fav => fav.productId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    const existing = await Favorite.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    
    const favorite = new Favorite({ userId, productId });
    await favorite.save();
    
    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/favorites', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    const result = await Favorite.findOneAndDelete({ userId, productId });
    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/favorites/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const favorite = await Favorite.findOne({ userId, productId });
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cart Routes
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    const populatedItems = await Promise.all(cart.items.map(async (item) => {
      try {
        const product = await Product.findById(item.productId);
        return {
          _id: item._id,
          productId: item.productId,
          name: product ? product.name : item.name,
          price: product ? product.price : item.price,
          image: product ? product.image : item.image,
          quantity: item.quantity
        };
      } catch (error) {
        return item;
      }
    }));
    
    res.json({ ...cart.toObject(), items: populatedItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, name, price, quantity } = req.body;
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ productId, name, price, quantity, image: req.body.image });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Homepage Models
const homepageSlideSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  buttonText: String,
  image: String,
  bgColor: String,
  textColor: String,
  order: Number,
  isActive: { type: Boolean, default: true }
});

const offerSchema = new mongoose.Schema({
  text: String,
  icon: String,
  order: Number,
  isActive: { type: Boolean, default: true }
});

const featureSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  order: Number,
  isActive: { type: Boolean, default: true }
});

const HomepageSlide = mongoose.model('HomepageSlide', homepageSlideSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Feature = mongoose.model('Feature', featureSchema);

// Homepage Slides Routes
app.get('/api/homepage/slides', async (req, res) => {
  try {
    const slides = await HomepageSlide.find({ isActive: true }).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/homepage/slides', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const slide = new HomepageSlide({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });
    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/homepage/slides/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    const slide = await HomepageSlide.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/homepage/slides/:id', authMiddleware, async (req, res) => {
  try {
    const slide = await HomepageSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Offers Routes
app.get('/api/homepage/offers', async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ order: 1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/homepage/offers', authMiddleware, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/homepage/offers/:id', authMiddleware, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/homepage/offers/:id', authMiddleware, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Features Routes
app.get('/api/homepage/features', async (req, res) => {
  try {
    const features = await Feature.find({ isActive: true }).sort({ order: 1 });
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/homepage/features', authMiddleware, async (req, res) => {
  try {
    const feature = new Feature(req.body);
    await feature.save();
    res.status(201).json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/homepage/features/:id', authMiddleware, async (req, res) => {
  try {
    const feature = await Feature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/homepage/features/:id', authMiddleware, async (req, res) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});