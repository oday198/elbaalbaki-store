'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShoppingBag, X, Edit, Trash2, Plus, LogOut, Check, Image, Tag, Star, Truck } from 'lucide-react';

const API_URL = 'https://elbaalbaki-backend.onrender.com';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [slides, setSlides] = useState([]);
  const [offers, setOffers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [shippingSettings, setShippingSettings] = useState({
    shippingFee: 0,
    freeShippingThreshold: 0,
    shippingEnabled: true
  });
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  
  // Editing states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  
  // Forms
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'General',
    inStock: true
  });
  
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    buttonText: 'SHOP NOW',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-900',
    order: 0
  });
  
  const [offerForm, setOfferForm] = useState({
    text: '',
    icon: '🎁',
    order: 0
  });
  
  const [featureForm, setFeatureForm] = useState({
    title: '',
    description: '',
    icon: '⭐',
    order: 0
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, ordersRes, slidesRes, offersRes, featuresRes, shippingRes] = await Promise.all([
        axios.get(`${API_URL}/api/products`),
        axios.get(`${API_URL}/api/orders`, config),
        axios.get(`${API_URL}/api/homepage/slides`),
        axios.get(`${API_URL}/api/homepage/offers`),
        axios.get(`${API_URL}/api/homepage/features`),
        axios.get(`${API_URL}/api/shipping-settings`)
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setSlides(slidesRes.data);
      setOffers(offersRes.data);
      setFeatures(featuresRes.data);
      setShippingSettings(shippingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, loginData);
      localStorage.setItem('adminToken', response.data.token);
      setIsLoggedIn(true);
      fetchData();
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  // Shipping Settings Functions
  const handleShippingSettingsUpdate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/api/shipping-settings`, shippingSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Shipping settings updated successfully!');
    } catch (error) {
      console.error('Error updating shipping settings:', error);
      alert('Error updating shipping settings');
    }
  };

  // Product Functions
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      Object.keys(productForm).forEach(key => {
        formData.append(key, productForm[key]);
      });

      if (imageFile) formData.append('image', imageFile);
      if (videoFile) formData.append('video', videoFile);

      if (editingProduct) {
        await axios.put(`${API_URL}/api/products/${editingProduct._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/api/products`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category: 'General', inStock: true });
      setImageFile(null);
      setVideoFile(null);
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: product.inStock
    });
    setShowProductModal(true);
  };

  // Slide Functions
  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      Object.keys(slideForm).forEach(key => {
        formData.append(key, slideForm[key]);
      });

      if (imageFile) formData.append('image', imageFile);

      if (editingSlide) {
        await axios.put(`${API_URL}/api/homepage/slides/${editingSlide._id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${API_URL}/api/homepage/slides`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setShowSlideModal(false);
      setEditingSlide(null);
      setSlideForm({
        title: '',
        subtitle: '',
        buttonText: 'SHOP NOW',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-900',
        order: 0
      });
      setImageFile(null);
      fetchData();
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Error saving slide');
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API_URL}/api/homepage/slides/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting slide:', error);
        alert('Error deleting slide');
      }
    };

  const handleEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle,
      buttonText: slide.buttonText,
      bgColor: slide.bgColor,
      textColor: slide.textColor,
      order: slide.order
    });
    setShowSlideModal(true);
  };

  // Offer Functions
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');

      if (editingOffer) {
        await axios.put(`${API_URL}/api/homepage/offers/${editingOffer._id}`, offerForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/homepage/offers`, offerForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowOfferModal(false);
      setEditingOffer(null);
      setOfferForm({ text: '', icon: '🎁', order: 0 });
      fetchData();
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error saving offer');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/homepage/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      text: offer.text,
      icon: offer.icon,
      order: offer.order
    });
    setShowOfferModal(true);
  };

  // Feature Functions
  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');

      if (editingFeature) {
        await axios.put(`${API_URL}/api/homepage/features/${editingFeature._id}`, featureForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/homepage/features`, featureForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowFeatureModal(false);
      setEditingFeature(null);
      setFeatureForm({ title: '', description: '', icon: '⭐', order: 0 });
      fetchData();
    } catch (error) {
      console.error('Error saving feature:', error);
      alert('Error saving feature');
    }
  };

  const handleDeleteFeature = async (id) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/homepage/features/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting feature:', error);
    }
  };

  const handleEditFeature = (feature) => {
    setEditingFeature(feature);
    setFeatureForm({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      order: feature.order
    });
    setShowFeatureModal(true);
  };

  // Order Functions
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm md:text-base"
          >
            <LogOut size={18} className="md:w-5 md:h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left">
                <p className="text-blue-100 mb-1 md:mb-2 text-xs md:text-base">Products</p>
                <p className="text-2xl md:text-4xl font-bold">{products.length}</p>
              </div>
              <Package size={32} className="opacity-80 md:w-12 md:h-12" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left">
                <p className="text-purple-100 mb-1 md:mb-2 text-xs md:text-base">Orders</p>
                <p className="text-2xl md:text-4xl font-bold">{orders.length}</p>
              </div>
              <ShoppingBag size={32} className="opacity-80 md:w-12 md:h-12" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left">
                <p className="text-green-100 mb-1 md:mb-2 text-xs md:text-base">Slides</p>
                <p className="text-2xl md:text-4xl font-bold">{slides.length}</p>
              </div>
              <Image size={32} className="opacity-80 md:w-12 md:h-12" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-2 md:gap-0">
              <div className="text-center md:text-left">
                <p className="text-orange-100 mb-1 md:mb-2 text-xs md:text-base">Offers</p>
                <p className="text-2xl md:text-4xl font-bold">{offers.length}</p>
              </div>
              <Tag size={32} className="opacity-80 md:w-12 md:h-12" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            {['products', 'orders', 'slides', 'offers', 'features', 'shipping'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-fit py-3 md:py-4 px-3 md:px-6 font-semibold transition whitespace-nowrap text-xs md:text-base ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Products</h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: '', description: '', price: '', category: 'General', inStock: true });
                      setShowProductModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
                  >
                    <Plus size={18} className="md:w-5 md:h-5" />
                    <span className="hidden md:inline">Add Product</span>
                    <span className="md:hidden">Add</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {products.map(product => (
                    <div key={product._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                      <img
                        src={`${API_URL}${product.image}`}
                        alt={product.name}
                        className="w-full h-40 md:h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-bold text-base md:text-lg mb-2 text-gray-900">{product.name}</h3>
                      <p className="text-gray-700 text-sm mb-2">{product.description}</p>
                      <p className="text-blue-600 font-bold text-lg md:text-xl mb-4">${product.price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm md:text-base"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm md:text-base"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab - IMPROVED MOBILE */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Orders</h2>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 md:p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-base md:text-lg text-gray-900">Order #{order.orderNumber}</p>
                          <p className="text-gray-600 text-xs md:text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                          <p className="font-semibold text-gray-900 mb-2">Customer:</p>
                          <p className="text-gray-800 font-medium">{order.customerName}</p>
                          <p className="text-gray-700">{order.customerPhone}</p>
                          <p className="text-sm text-gray-600">{order.customerAddress}</p>
                        </div>
                        <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                          <p className="font-semibold text-gray-900 mb-2">Items:</p>
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-800">
                              {item.name} x{item.quantity} - <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </p>
                          ))}
                          {order.shippingFee > 0 && (
                            <p className="text-sm font-semibold mt-2 text-gray-800">
                              Shipping Fee: ${order.shippingFee.toFixed(2)}
                            </p>
                          )}
                          <p className="font-bold text-lg mt-2 text-gray-900">Total: ${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateOrderStatus(order._id, status)}
                            className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition text-xs md:text-sm ${
                              order.status === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slides Tab */}
            {activeTab === 'slides' && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Homepage Slides</h2>
                  <button
                    onClick={() => {
                      setEditingSlide(null);
                      setSlideForm({
                        title: '',
                        subtitle: '',
                        buttonText: 'SHOP NOW',
                        bgColor: 'bg-gray-50',
                        textColor: 'text-gray-900',
                        order: 0
                      });
                      setShowSlideModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
                  >
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Slide</span>
                    <span className="md:hidden">Add</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {slides.map(slide => (
                    <div key={slide._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-40 md:h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-bold text-base md:text-lg mb-2 text-gray-900">{slide.title}</h3>
                      <p className="text-gray-700 text-sm mb-2">{slide.subtitle}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlide(slide)}
                          className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Rotating Offers</h2>
                  <button
                    onClick={() => {
                      setEditingOffer(null);
                      setOfferForm({ text: '', icon: '🎁', order: 0 });
                      setShowOfferModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
                  >
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Offer</span>
                    <span className="md:hidden">Add</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {offers.map(offer => (
                    <div key={offer._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{offer.icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-900">{offer.text}</h3>
                            <p className="text-gray-600 text-sm">Order: {offer.order}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="bg-yellow-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer._id)}
                            className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div>
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Features Section</h2>
                  <button
                    onClick={() => {
                      setEditingFeature(null);
                      setFeatureForm({ title: '', description: '', icon: '⭐', order: 0 });
                      setShowFeatureModal(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
                  >
                    <Plus size={18} />
                    <span className="hidden md:inline">Add Feature</span>
                    <span className="md:hidden">Add</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {features.map(feature => (
                    <div key={feature._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gray-100 p-3 rounded-full border border-gray-300">
                          <span className="text-xl">{feature.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{feature.title}</h3>
                          <p className="text-gray-600 text-sm">Order: {feature.order}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">{feature.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditFeature(feature)}
                          className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(feature._id)}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Settings Tab */}
            {activeTab === 'shipping' && (
              <div>
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Shipping Settings</h2>
                  <p className="text-gray-600 text-sm md:text-base">Configure shipping fees and free shipping thresholds</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-8 border border-blue-100">
                  <div className="max-w-2xl space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                      <Truck size={24} className="text-blue-600 md:w-8 md:h-8" />
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">Shipping Configuration</h3>
                    </div>

                    <div className="bg-white rounded-lg p-4 md:p-6 space-y-4 md:space-y-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 md:mb-3 text-sm md:text-base">
                          Shipping Fee ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={shippingSettings.shippingFee}
                          onChange={(e) => setShippingSettings({ 
                            ...shippingSettings, 
                            shippingFee: parseFloat(e.target.value) || 0 
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg text-gray-900"
                          placeholder="0.00"
                        />
                        <p className="text-xs md:text-sm text-gray-600 mt-2">
                          Set to 0 for free shipping on all orders
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 md:mb-3 text-sm md:text-base">
                          Free Shipping Threshold ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={shippingSettings.freeShippingThreshold}
                          onChange={(e) => setShippingSettings({ 
                            ...shippingSettings, 
                            freeShippingThreshold: parseFloat(e.target.value) || 0 
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg text-gray-900"
                          placeholder="0.00"
                        />
                        <p className="text-xs md:text-sm text-gray-600 mt-2">
                          Orders above this amount get free shipping. Set to 0 to disable.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={shippingSettings.shippingEnabled}
                          onChange={(e) => setShippingSettings({ 
                            ...shippingSettings, 
                            shippingEnabled: e.target.checked 
                          })}
                          className="w-5 h-5 rounded"
                        />
                        <label className="font-semibold text-gray-800 text-sm md:text-base">
                          Enable Shipping Fees
                        </label>
                      </div>

                      <div className="border-t border-gray-200 pt-4 md:pt-6">
                        <h4 className="font-bold text-gray-800 mb-3 text-sm md:text-base">Preview:</h4>
                        <div className="space-y-2 text-xs md:text-sm text-gray-700">
                          {shippingSettings.shippingEnabled ? (
                            <>
                              <p>• Standard shipping fee: <span className="font-bold text-gray-900">${shippingSettings.shippingFee.toFixed(2)}</span></p>
                              {shippingSettings.freeShippingThreshold > 0 && (
                                <p>• Free shipping for orders over: <span className="font-bold text-gray-900">${shippingSettings.freeShippingThreshold.toFixed(2)}</span></p>
                              )}
                              {shippingSettings.shippingFee === 0 && (
                                <p className="text-green-600 font-semibold">• All orders ship free!</p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-600">Shipping fees are currently disabled</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleShippingSettingsUpdate}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 md:py-4 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Check size={18} className="md:w-5 md:h-5" />
                        Save Shipping Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Product Video (Optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="font-semibold text-gray-800">In Stock</label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{editingSlide ? 'Edit Slide' : 'Add Slide'}</h3>
              <button onClick={() => setShowSlideModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSlideSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Title</label>
                <input
                  type="text"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Subtitle</label>
                <input
                  type="text"
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Button Text</label>
                <input
                  type="text"
                  value={slideForm.buttonText}
                  onChange={(e) => setSlideForm({ ...slideForm, buttonText: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Background Color</label>
                  <select
                    value={slideForm.bgColor}
                    onChange={(e) => setSlideForm({ ...slideForm, bgColor: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  >
                    <option value="bg-gray-50">Light Gray</option>
                    <option value="bg-gray-900">Dark Gray</option>
                    <option value="bg-white">White</option>
                    <option value="bg-black">Black</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2 text-gray-800">Text Color</label>
                  <select
                    value={slideForm.textColor}
                    onChange={(e) => setSlideForm({ ...slideForm, textColor: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  >
                    <option value="text-gray-900">Dark Gray</option>
                    <option value="text-white">White</option>
                    <option value="text-black">Black</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Slide Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-2 border rounded-lg"
                  required={!editingSlide}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Order (Display sequence)</label>
                <input
                  type="number"
                  value={slideForm.order}
                  onChange={(e) => setSlideForm({ ...slideForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {editingSlide ? 'Update Slide' : 'Add Slide'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{editingOffer ? 'Edit Offer' : 'Add Offer'}</h3>
              <button onClick={() => setShowOfferModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Offer Text</label>
                <input
                  type="text"
                  value={offerForm.text}
                  onChange={(e) => setOfferForm({ ...offerForm, text: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="✨ FREE INSTALLATION on all air conditioners"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Icon (Emoji)</label>
                <input
                  type="text"
                  value={offerForm.icon}
                  onChange={(e) => setOfferForm({ ...offerForm, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="🎁"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Order (Display sequence)</label>
                <input
                  type="number"
                  value={offerForm.order}
                  onChange={(e) => setOfferForm({ ...offerForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {editingOffer ? 'Update Offer' : 'Add Offer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">{editingFeature ? 'Edit Feature' : 'Add Feature'}</h3>
              <button onClick={() => setShowFeatureModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFeatureSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-800">Title</label>
                <input
                  type="text"
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="Free Shipping"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Description</label>
                <input
                  type="text"
                  value={featureForm.description}
                  onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="On orders over $100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Icon (Emoji)</label>
                <input
                  type="text"
                  value={featureForm.icon}
                  onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="🚚"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-800">Order (Display sequence)</label>
                <input
                  type="number"
                  value={featureForm.order}
                  onChange={(e) => setFeatureForm({ ...featureForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                {editingFeature ? 'Update Feature' : 'Add Feature'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}