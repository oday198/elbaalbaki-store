'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, ChevronRight, ChevronLeft, Menu, X, Plus, Minus, Phone, MapPin, User, Filter, ChevronDown, ShoppingBag, Heart, Share2, Truck, Shield, Star, Check } from 'lucide-react';
import { useCart } from './context/CartContext';

const API_URL = 'https://elbaalbaki-backend.onrender.com';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const sliderRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [useSearchEndpoint, setUseSearchEndpoint] = useState(false);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getSubtotal, getShippingFee, getTotalItems, isLoading, shippingSettings } = useCart();

  const [slides, setSlides] = useState([]);
  const [offers, setOffers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState({});

  // Footer categories
  const footerCategories = ['OUTDOOR', 'ELECTRONICS', 'IT & OFFICE', 'BIG APPLIANCES', 'SMALL APPLIANCES'];

  // Currency options
  const currencies = ['USD', 'EUR', 'GBP', 'AED'];

  useEffect(() => {
    fetchProducts();
    fetchHomepageData();
    loadFavorites();
    
    const interval = setInterval(() => {
      if (slides.length > 0) {
        nextSlide();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  // Smooth scrolling and toast setup
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Toast notification function
    window.showToast = (message, type = 'info') => {
      const toast = document.createElement('div');
      toast.className = `toast fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg shadow-xl border-l-4 ${
        type === 'success' ? 'border-green-500 bg-green-50' :
        type === 'error' ? 'border-red-500 bg-red-50' :
        type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
        'border-blue-500 bg-blue-50'
      }`;
      
      const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-lg">${icon}</span>
          <span class="font-medium">${message}</span>
        </div>
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (window.showToast) window.showToast('Error loading products', 'error');
    }
  };

  const fetchHomepageData = async () => {
    try {
      const [slidesRes, offersRes, featuresRes] = await Promise.all([
        axios.get(`${API_URL}/api/homepage/slides`),
        axios.get(`${API_URL}/api/homepage/offers`),
        axios.get(`${API_URL}/api/homepage/features`)
      ]);
      setSlides(slidesRes.data);
      setOffers(offersRes.data);
      setFeatures(featuresRes.data);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setSlides([
        {
          id: 1,
          title: "Vintage Collection",
          subtitle: "Classic designs, modern performance",
          buttonText: "SHOP NOW",
          bgColor: "bg-gray-50",
          textColor: "text-gray-900",
          image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
        }
      ]);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/favorites/guest`);
      const favoriteIds = response.data.map(fav => fav._id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleAddToCart = async (product) => {
      setIsAddingToCart({ [product._id]: true });
      addToCart(product);
      
      if (window.showToast) {
        window.showToast(`${product.name} added to cart!`, 'success');
      }
      
      // Button animation feedback
      setTimeout(() => {
        setIsAddingToCart({ [product._id]: false });
      }, 1000);
    };

    const handleCheckout = () => {
      if (cart.length === 0) {
        if (window.showToast) window.showToast('Your cart is empty', 'warning');
        return;
      }
      setShowCart(false);
      setShowCheckout(true);
    };

  const handlePlaceOrder = async () => {
      if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
        if (window.showToast) window.showToast('Please fill in all required fields', 'error');
        return;
      }

    try {
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        notes: customerInfo.notes,
        items: cart.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: getTotalPrice(),
        shippingFee: getShippingFee() // Add shipping fee to order
      };

      await axios.post(`${API_URL}/api/orders`, orderData);

      clearCart();
      setShowCheckout(false);
      setCustomerInfo({ name: '', phone: '', address: '', notes: '' });
      
      if (window.showToast) window.showToast('Order placed successfully!', 'success');
      
    } catch (error) {
      console.error('Error placing order:', error);
      if (window.showToast) window.showToast('Error placing order', 'error');
    }
  };

  const isFavorited = (productId) => {
    return favorites.includes(productId);
  };

  const handleFavoriteToggle = async (product) => {
    try {
      const userId = 'guest';
      if (isFavorited(product._id)) {
        await axios.delete(`${API_URL}/api/favorites`, {
          data: { userId, productId: product._id }
        });
        setFavorites(favorites.filter(id => id !== product._id));
        if (window.showToast) window.showToast('Removed from favorites', 'info');
      } else {
        await axios.post(`${API_URL}/api/favorites`, {
          userId,
          productId: product._id
        });
        setFavorites([...favorites, product._id]);
        if (window.showToast) window.showToast('Added to favorites!', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (window.showToast) window.showToast('Error updating favorites', 'error');
    }
  };

  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      setFavorites([]);
      if (window.showToast) window.showToast('Favorites cleared', 'info');
    }
  };

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await axios.get(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
      setUseSearchEndpoint(true);
    } catch (error) {
      console.error('Search error, falling back to frontend search:', error);
      setUseSearchEndpoint(false);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useRef(null);
  useEffect(() => {
    debouncedSearch.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
        setUseSearchEndpoint(false);
      }
    }, 300);

    return () => {
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, [searchQuery]);

  let filteredProducts = [];

  if (searchQuery.trim() && useSearchEndpoint) {
    filteredProducts = searchResults;
  } else {
    filteredProducts = products.filter(product => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase().trim();
      const productName = product.name?.toLowerCase() || '';
      const productDescription = product.description?.toLowerCase() || '';
      const productCategory = product.category?.toLowerCase() || '';
      
      return (
        productName.includes(query) ||
        productDescription.includes(query) ||
        productCategory.includes(query) ||
        productName.split(' ').some(word => word.includes(query)) ||
        productDescription.split(' ').some(word => word.includes(query))
      );
    });
  }

  const getItemId = (item) => {
    return item.productId || item._id;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/64x64?text=Product";
  };

  const handleShareProduct = async (product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at ELBAALBAKI ELECTRIC`,
          url: window.location.href,
        });
        if (window.showToast) window.showToast('Product shared!', 'success');
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      if (window.showToast) window.showToast('Link copied to clipboard', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top WhatsApp Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 text-sm text-center">
        <div className="container mx-auto px-4">
          <span className="font-medium">AIR CONDITIONER SALE | </span>
          <a href="https://wa.me/76922894" className="underline hover:opacity-80 transition hover:text-green-400">
            whatsapp us on 76 - 922 894
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top header with logo, search, cart */}
          <div className="py-4 flex items-center justify-between">
            {/* Left: Menu button (mobile) and Logo */}
            <div className="flex items-center gap-6">
              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex flex-col cursor-pointer group">
                <h1 className="text-xl md:text-2xl font-light tracking-widest text-uppercase group-hover:scale-105 transition-transform">
                  <span className="font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">ELBAALBAKI</span> ELECTRIC
                </h1>
                <p className="text-xs text-gray-500 -mt-1 group-hover:text-gray-700 transition hidden md:block">Premium Electronics & Appliances</p>
              </div>
            </div>

            {/* Center: Search (desktop) */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  className="input-field pl-12 pr-4 py-3 text-sm rounded-full border-2 focus:border-gray-900 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition" size={18} />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  </div>
                )}

                {searchQuery.trim() && searchResults.length > 0 && !isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-slideDown">
                    <div className="p-3">
                      <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                        Found {searchResults.length} products
                      </div>
                      {searchResults.slice(0, 8).map((product) => (
                        <div
                          key={product._id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 group/item"
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                              src={`${API_URL}${product.image}`}
                              alt={product.name}
                              className="w-10 h-10 object-contain group-hover/item:scale-110 transition-transform"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/100x100?text=Product";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate">{product.description.substring(0, 60)}...</div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">${product.price.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Currency selector, cart, favorites */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Currency selector */}
              <div className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="currency-selector cursor-pointer bg-transparent focus:outline-none"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-gray-500" />
              </div>

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all group"
              >
                <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Favorites */}
              <button
                onClick={() => setShowFavorites(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all group"
              >
                <Heart 
                  size={22} 
                  className={`group-hover:scale-110 transition-transform ${
                    favorites.length > 0 ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Rotating Offers Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100 py-3">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10"></div>
              
              <div className="overflow-hidden">
                <div 
                  className="flex whitespace-nowrap animate-marquee"
                  style={{ animationDuration: '40s' }}
                >
                  {offers.length > 0 ? (
                    <>
                      {offers.map((offer, index) => (
                        <div 
                          key={`offer-${offer._id || index}`} 
                          className="inline-flex items-center mx-8 group"
                        >
                          <span className="text-xl mr-2 transform group-hover:scale-110 transition-transform animate-pulse">
                            {offer.icon}
                          </span>
                          <span className="font-medium text-gray-800 text-sm tracking-wide group-hover:text-gray-900 transition">
                            {offer.text}
                          </span>
                          <div className="ml-8 h-4 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
                        </div>
                      ))}
                      {offers.map((offer, index) => (
                        <div 
                          key={`offer-dup-${offer._id || index}`} 
                          className="inline-flex items-center mx-8 group"
                        >
                          <span className="text-xl mr-2 transform group-hover:scale-110 transition-transform">
                            {offer.icon}
                          </span>
                          <span className="font-medium text-gray-800 text-sm tracking-wide">
                            {offer.text}
                          </span>
                          <div className="ml-8 h-4 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { id: 1, text: "✨ FREE INSTALLATION on all air conditioners", icon: "🎁" },
                        { id: 2, text: "🇫🇷 Parisian Style Collection - Limited Time", icon: "🇫🇷" },
                        { id: 3, text: "🔥 HOT DEAL: Buy 2 Get 10% OFF", icon: "🔥" },
                      ].map((offer, index) => (
                        <div 
                          key={`offer-${offer.id}`} 
                          className="inline-flex items-center mx-8 group"
                        >
                          <span className="text-xl mr-2 transform group-hover:scale-110 transition-transform">
                            {offer.icon}
                          </span>
                          <span className="font-medium text-gray-800 text-sm tracking-wide">
                            {offer.text}
                          </span>
                          <div className="ml-8 h-4 w-px bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden mt-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="input-field pl-12 pr-4 py-3 text-sm rounded-full border-2 focus:border-gray-900 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-40 rounded-b-2xl animate-slideDown">
              <div className="px-4 py-3">
                <div className="space-y-1">
                  {footerCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category.toLowerCase());
                        setShowMobileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all hover:pl-6"
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-700">Currency</span>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-sm border-none bg-transparent focus:outline-none"
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Slider - IMPROVED FOR MOBILE */}
      <div className="relative hero-slider overflow-hidden bg-white mx-2 md:mx-4 mt-2 rounded-lg md:rounded-xl shadow-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          ref={sliderRef}
        >
          {slides.length > 0 ? slides.map((slide, index) => (
            <div 
              key={slide._id || slide.id || index}
              className="w-full flex-shrink-0 relative"
              style={{ minHeight: '200px' }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${
                    slide.image.startsWith('http') 
                      ? slide.image 
                      : `${API_URL}${slide.image}`
                  })` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>
              
              {/* SMALLER CONTENT BOX AT BOTTOM */}
                <div className="relative container mx-auto px-4 h-full flex items-end pb-4 md:pb-8"> {/* Reduced pb-6 to pb-4 */}
                 <div className={`max-w-xs w-full p-2 md:p-3 ${slide.bgColor} ${slide.textColor} bg-opacity-95 rounded-md backdrop-blur-sm border border-white/20 shadow-md`}> {/* Changed max-w-md to max-w-sm, reduced padding */}
                <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight font-serif"> {/* Smaller font, added font-serif */}
                    {slide.title}
                  </h2>
                  <p className="text-sm md:text-base mb-3 opacity-90 font-light italic"> {/* Smaller, italic, lighter */}
                    {slide.subtitle}
                  </p>
                  <button className="btn-primary px-4 py-2 text-xs md:text-sm rounded-lg hover:scale-105 transition-transform shadow-lg">
                    {slide.buttonText} <ChevronRight size={14} className="inline ml-1" /> {/* Smaller icon */}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="w-full flex-shrink-0 relative" style={{ minHeight: '200px' }}>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full flex items-center justify-center">
                <p className="text-gray-500 text-lg">No slides available</p>
              </div>
            </div>
          )}
        </div>

        {/* Slider Navigation */}
        <button
          onClick={prevSlide}
          className="slider-nav prev hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="slider-nav next hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slider Dots */}
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`slider-dot ${currentSlide === index ? 'active scale-125' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {features.length > 0 ? (
              features.map((feature, index) => (
                <div key={feature._id || index} className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 md:p-4 rounded-xl md:rounded-2xl flex-shrink-0">
                    <span className="text-2xl md:text-3xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 md:mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 p-3 md:p-4 rounded-xl md:rounded-2xl">
                    <Truck size={24} className="text-gray-700 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 md:mb-2">Free Shipping</h4>
                    <p className="text-gray-600 text-sm md:text-base">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-3 md:p-4 rounded-xl md:rounded-2xl">
                    <Shield size={24} className="text-gray-700 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 md:mb-2">2-Year Warranty</h4>
                    <p className="text-gray-600 text-sm md:text-base">On all products</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 md:p-4 rounded-xl md:rounded-2xl">
                    <Star size={24} className="text-gray-700 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 md:mb-2">Premium Quality</h4>
                    <p className="text-gray-600 text-sm md:text-base">Branded products only</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Products</h3>
            <p className="text-gray-600 text-base md:text-lg">Carefully selected for quality and performance</p>
          </div>
          <button className="btn-secondary text-sm px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            View All <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="product-card group hover:shadow-2xl">
                {/* FULL WIDTH IMAGE - NO SIDE SPACES */}
                <div className="product-card-image">
                  {product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 12 * 60 * 60 * 1000) && (
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10">
                      <div className="badge badge-new px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-lg text-xs">NEW</div>
                    </div>
                  )}
                  <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10 flex flex-col gap-2">
                    <button 
                      onClick={() => handleFavoriteToggle(product)}
                      className={`p-1.5 md:p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg ${
                        isFavorited(product._id) 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <Heart 
                        size={16} 
                        className="md:w-[18px] md:h-[18px]"
                        fill={isFavorited(product._id) ? "currentColor" : "none"}
                      />
                    </button>
                    <button 
                      onClick={() => handleShareProduct(product)}
                      className="p-1.5 md:p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 shadow-lg"
                    >
                      <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
                    </button>
                  </div>
                  <img
                    src={`${API_URL}${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={handleImageError}
                  />
                </div>
                
                {/* PRODUCT CONTENT */}
                <div className="product-card-content">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 md:px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm md:text-lg mb-2 md:mb-3 line-clamp-2">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  
                  {product.rating && (
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={`md:w-[14px] md:h-[14px] ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews || 0})</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-3 md:pt-4 border-t border-gray-100 gap-2 md:gap-0 mt-auto">
                    <div>
                      <div className="price text-lg md:text-2xl font-bold">${product.price.toFixed(2)}</div>
                      {product.oldPrice && (
                        <div className="price-old text-xs md:text-sm text-gray-400">${product.oldPrice.toFixed(2)}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart[product._id]}
                      className={`btn-primary text-xs md:text-sm py-2 md:py-3 px-3 md:px-6 rounded-lg md:rounded-xl flex items-center gap-2 w-full md:w-auto justify-center ${
                        isAddingToCart[product._id] ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                    >
                      {isAddingToCart[product._id] ? (
                        <>
                          <Check size={14} className="md:w-4 md:h-4" />
                          <span className="hidden md:inline">Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} className="md:hidden" />
                          <span className="md:hidden">Add</span>
                          <span className="hidden md:inline">Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
            <p className="text-gray-600 text-xl">No products found. Try a different search or category.</p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Shopping Cart</h3>
                  <p className="text-gray-500 text-sm mt-1">{getTotalItems()} items</p>
                </div>
                <button 
                  onClick={() => setShowCart(false)} 
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition"
                >
                  <X size={22} />
                </button>
              </div>

              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-900 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-gray-600">Loading cart...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
                  <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="btn-primary px-8 py-3 rounded-xl"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    {cart.map((item, index) => {
                      const itemId = getItemId(item);
                      return (
                        <div key={`${itemId}-${index}`} className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:border-gray-300 transition">
                          <div className="w-20 h-20 bg-white rounded-xl p-3 flex items-center justify-center">
                            <img
                              src={`${API_URL}${item.image}`}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={handleImageError}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h4>
                            <p className="text-gray-700 font-bold text-lg mb-3">${item.price?.toFixed(2) || '0.00'}</p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-lg min-w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition"
                              >
                                <Plus size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  removeFromCart(itemId);
                                  if (window.showToast) window.showToast('Item removed from cart', 'info');
                                }}
                                className="ml-auto text-red-600 hover:text-red-700 font-medium text-sm transition"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-8 mb-8">
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold text-lg">${getSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base">
                          <span className="text-gray-600">Shipping</span>
                          {getShippingFee() === 0 ? (
                            <span className="font-bold text-green-600">Free</span>
                          ) : (
                            <span className="font-bold text-lg">${getShippingFee().toFixed(2)}</span>
                          )}
                        </div>
                        {shippingSettings.freeShippingThreshold > 0 && getSubtotal() < shippingSettings.freeShippingThreshold && getShippingFee() > 0 && (
                          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                            💡 Add ${(shippingSettings.freeShippingThreshold - getSubtotal()).toFixed(2)} more for free shipping!
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-xl font-bold mb-8 border-t border-gray-200 pt-6">
                        <span>Total:</span>
                        <span className="text-gray-900">${getTotalPrice().toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <button
                          onClick={handleCheckout}
                          className="w-full btn-primary py-4 font-bold rounded-xl text-lg hover:scale-[1.02] transition-transform"
                        >
                          Proceed to Checkout
                        </button>
                        <button
                          onClick={() => setShowCart(false)}
                          className="w-full btn-secondary py-3 rounded-xl"
                        >
                          Continue Shopping
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to clear your cart?')) {
                              clearCart();
                              if (window.showToast) window.showToast('Cart cleared', 'info');
                            }
                          }}
                          className="w-full text-red-600 border-2 border-red-600 py-3 rounded-xl hover:bg-red-50 transition font-medium"
                        >
                          Clear Cart
                        </button>
                      </div>
                    </div>

                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Sidebar */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Favorites</h3>
                  <p className="text-gray-500 text-sm mt-1">{favorites.length} items</p>
                </div>
                <button 
                  onClick={() => setShowFavorites(false)} 
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition"
                >
                  <X size={22} />
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Heart size={64} className="mx-auto text-gray-300 mb-6" />
                  <p className="text-gray-600 text-lg mb-6">No favorites yet</p>
                  <button 
                    onClick={() => setShowFavorites(false)}
                    className="btn-primary px-8 py-3 rounded-xl"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <button
                      onClick={handleClearFavorites}
                      className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
                    >
                      Clear All Favorites
                    </button>
                  </div>
                  <div className="space-y-4">
                    {products
                      .filter(product => favorites.includes(product._id))
                      .map(product => (
                        <div key={product._id} className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:border-gray-300 transition">
                          <div className="w-20 h-20 bg-white rounded-xl p-3 flex items-center justify-center">
                            <img
                              src={`${API_URL}${product.image}`}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h4>
                            <p className="text-gray-700 font-bold text-lg mb-3">${product.price?.toFixed(2)}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="btn-primary text-xs py-2 px-4 rounded-lg"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => handleFavoriteToggle(product)}
                                className="btn-secondary text-xs py-2 px-4 rounded-lg"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
              <h3 className="text-2xl font-bold text-gray-900">Complete Your Order</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2.5 hover:bg-gray-100 rounded-xl transition">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="input-field rounded-xl"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="input-field rounded-xl"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Delivery Address *
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="input-field rounded-xl"
                  placeholder="Enter your complete address"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  className="input-field rounded-xl"
                  placeholder="Special instructions, delivery timing, etc."
                  rows="2"
                />
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-600">Shipping:</span>
                    {getShippingFee() === 0 ? (
                      <span className="font-semibold text-green-600">Free</span>
                    ) : (
                      <span className="font-semibold">${getShippingFee().toFixed(2)}</span>
                    )}
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between text-xl font-bold">
                    <span>Order Total:</span>
                    <span className="text-gray-900">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                {shippingSettings.freeShippingThreshold > 0 && getSubtotal() >= shippingSettings.freeShippingThreshold && getShippingFee() === 0 && (
                  <p className="text-green-600 text-sm mt-3 font-semibold">
                    🎉 You qualified for free shipping!
                  </p>
                )}
                {getShippingFee() === 0 && shippingSettings.freeShippingThreshold === 0 && shippingSettings.shippingFee === 0 && (
                  <p className="text-green-600 text-sm mt-3">All orders ship free!</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 rounded-2xl text-sm text-yellow-800">
                <p className="font-medium">
                  <strong>Note:</strong> Your order will be processed and you'll receive a confirmation shortly.
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold tracking-widest mb-6">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">ELBAALBAKI</span> ELECTRIC
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">Premium electronics and appliances at competitive prices. Quality guaranteed with 2-year warranty on all products.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Categories</h4>
              <ul className="space-y-4">
                {footerCategories.map(category => (
                  <li key={category}>
                    <a href="#" className="text-gray-400 hover:text-white transition hover:pl-2 block">
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Customer Service</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-white transition hover:pl-2 block">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition hover:pl-2 block">Shipping Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition hover:pl-2 block">Returns & Refunds</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition hover:pl-2 block">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Contact Info</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-500" />
                  <span>123 Electronics Street, City</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-500" />
                  <span>+1 234 567 8900</span>
                </li>
                <li className="flex items-center gap-3">
                  <User size={16} className="text-gray-500" />
                  <span>info@Elbaalbakielectric.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-500">🕒</span>
                  <span>Mon-Sat: 9AM-9PM</span>
                </li>
              </ul>
              <div className="mt-8">
                <a 
                  href="https://wa.me/76922894"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  <Phone size={16} />
                  WhatsApp: 76-922-894
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} ELBAALBAKI ELECTRIC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}