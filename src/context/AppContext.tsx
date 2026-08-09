/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, UserProfile } from '../types';
import { PRODUCTS } from '../data/products';
import { sendWelcomeEmail } from '../utils/emailApi';

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedArticleId: string | null;
  setSelectedArticleId: (id: string | null) => void;
  
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedFormat?: string, updateLastAdded?: boolean) => void;
  removeFromCart: (productId: string, selectedFormat?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedFormat?: string) => void;
  clearCart: () => void;
  
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  lastAddedItem: { product: Product; quantity: number; selectedFormat?: string } | null;
  closeCartDrawer: () => void;
  
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;
  
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  register: (data: { fullName: string; email: string; phone?: string; password?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  
  orders: Order[];
  placeOrder: (gateway: 'card-to-card' | 'zarinpal' | 'idpay', shippingAddress: Order['shippingAddress']) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingCode?: string) => void;
  refreshOrdersAndUsers: () => Promise<void>;
  trackOrderId: string | null;
  setTrackOrderId: (id: string | null) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  couponCode: string | null;
  discountPercentage: number;
  applyCoupon: (code: string, currentSubtotal?: number) => { success: boolean; message: string };
  removeCoupon: () => void;

  products: Product[];
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  addProduct: (newProduct: Product) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navigation & Routing State
  const [currentPage, setCurrentPageReal] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Wishlist & Recently Viewed
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [lastAddedItem, setLastAddedItem] = useState<{ product: Product; quantity: number; selectedFormat?: string } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('40gates_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  // User and Orders
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    province: 'تهران',
    city: 'تهران',
    postalCode: '',
    address: '',
    wishlist: [],
    recentlyViewed: []
  });
  const [orders, setOrders] = useState<Order[]>([]);

  // Products Catalog State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('40gates_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const missing = PRODUCTS.filter((p) => !existingIds.has(p.id));
          if (missing.length > 0) {
            return PRODUCTS.map((p) => parsed.find((item: any) => item.id === p.id) || p);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage:', e);
    }
    return PRODUCTS;
  });

  // Fetch products from server on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const existingIds = new Set(data.products.map((p: any) => p.id));
          const missing = PRODUCTS.filter((p) => !existingIds.has(p.id));
          const merged = missing.length > 0
            ? PRODUCTS.map((p) => data.products.find((item: any) => item.id === p.id) || p)
            : data.products;
          setProducts(merged);
          localStorage.setItem('40gates_products', JSON.stringify(merged));
        }
      })
      .catch((err) => console.warn('Failed to fetch products from server:', err));
  }, []);

  // Save products to localStorage & server whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('40gates_products', JSON.stringify(products));
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      }).catch((e) => console.warn('Failed to sync products with server:', e));
    } catch (e) {
      console.warn('Failed to save products to localStorage:', e);
    }
  }, [products]);

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetProducts = () => {
    setProducts(PRODUCTS);
    localStorage.removeItem('40gates_products');
  };

  const login = (email: string, password?: string): boolean => {
    setIsAuthenticated(true);
    localStorage.setItem('40gates_authenticated', 'true');
    if (email) {
      setUserProfile((prev) => ({
        ...prev,
        email: email || prev.email,
        fullName: prev.fullName || 'هنرجوی رویابینی شفاف'
      }));
    }
    setCurrentPage('dashboard');
    return true;
  };

  const register = async (data: { fullName: string; email: string; phone?: string; password?: string }) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || userProfile.phone || ''
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('40gates_profile', JSON.stringify(updatedProfile));
    
    // Sign the user in automatically
    setIsAuthenticated(true);
    localStorage.setItem('40gates_authenticated', 'true');

    // Send welcome email and register user on server
    try {
      fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone
        })
      }).catch(err => console.warn('User register server sync err:', err));

      await sendWelcomeEmail({
        email: data.email,
        fullName: data.fullName
      });
    } catch (e) {
      console.warn('Welcome email trigger error:', e);
    }

    // Redirect the user to their account dashboard
    setCurrentPage('dashboard');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('40gates_authenticated');
    setCurrentPage('home');
  };

  // Coupons
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Synchronized URL-hash router
  const setCurrentPage = (page: string) => {
    setCurrentPageReal(page);
    if (page === 'admin') {
      window.history.pushState(null, '', '/admin');
      window.location.hash = 'admin';
    } else {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentPageReal('admin');
        return;
      }
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        // Parse simple sub-arguments
        if (hash.startsWith('product/')) {
          const pid = hash.split('product/')[1];
          setSelectedProductId(pid);
          setCurrentPageReal('product-details');
        } else if (hash.startsWith('blog/')) {
          const aid = hash.split('blog/')[1];
          setSelectedArticleId(aid);
          setCurrentPageReal('blog-details');
        } else if (hash.startsWith('track/')) {
          const oid = hash.split('track/')[1];
          setTrackOrderId(oid);
          setCurrentPageReal('tracking');
        } else {
          setCurrentPageReal(hash);
        }
      } else {
        setCurrentPageReal('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial parse
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshOrdersAndUsers = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        localStorage.setItem('40gates_orders', JSON.stringify(data.orders));
      }
    } catch (err) {
      console.warn('Failed to refresh orders:', err);
    }
  };

  // Hydrate states from localStorage on startup
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('40gates_cart');
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem('40gates_wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedRecent = localStorage.getItem('40gates_recently_viewed');
      if (storedRecent) setRecentlyViewed(JSON.parse(storedRecent));

      const storedProfile = localStorage.getItem('40gates_profile');
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));

      const storedOrders = localStorage.getItem('40gates_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      // Fetch server orders and sync
      refreshOrdersAndUsers();
    } catch (e) {
      console.error('Failed to load storage state', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('40gates_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('40gates_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('40gates_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('40gates_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('40gates_orders', JSON.stringify(orders));
  }, [orders]);

  // Cart operations
  const closeCartDrawer = () => {
    setIsCartDrawerOpen(false);
  };

  const isDigitalProduct = (product: Product, format?: string) => {
    if (product.type === 'pdf' || product.type === 'audio' || product.type === 'course') return true;
    if (format) {
      const f = format.toLowerCase();
      if (f.includes('pdf') || f.includes('mp3') || f.includes('صوتی') || f.includes('الکترونیکی') || f.includes('دیجیتال') || f.includes('دوره')) {
        return true;
      }
    }
    return false;
  };

  const addToCart = (product: Product, quantity = 1, selectedFormat?: string, updateLastAdded = true) => {
    const format = selectedFormat || (product.type === 'pdf' ? 'کتاب الکترونیکی PDF' : product.type === 'audio' ? 'کتاب صوتی MP3' : 'نسخه چاپی');
    const isDigital = isDigitalProduct(product, format);
    
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedFormat === format
      );
      if (existingIndex > -1) {
        if (isDigital) {
          return prev; // Digital items are capped at 1 max
        }
        const nextCart = [...prev];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + quantity
        };
        return nextCart;
      }
      return [...prev, { product, quantity: isDigital ? 1 : quantity, selectedFormat: format }];
    });

    if (updateLastAdded) {
      setLastAddedItem({ product, quantity: isDigital ? 1 : quantity, selectedFormat: format });
    }
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, selectedFormat?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedFormat === selectedFormat))
    );
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedFormat?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedFormat);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedFormat === selectedFormat) {
          const isDigital = isDigitalProduct(item.product, item.selectedFormat);
          return { ...item, quantity: isDigital ? 1 : quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode(null);
    setDiscountPercentage(0);
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const active = prev.includes(productId);
      const updated = active ? prev.filter((id) => id !== productId) : [...prev, productId];
      setUserProfile(p => ({ ...p, wishlist: updated }));
      return updated;
    });
  };

  // Recently Viewed
  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10); // Keep last 10
      setUserProfile(p => ({ ...p, recentlyViewed: updated }));
      return updated;
    });
  };

  // User Profile
  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
  };

  // Place Order Simulation
  const placeOrder = (gateway: 'card-to-card' | 'zarinpal' | 'idpay', shippingAddress: Order['shippingAddress']): Order => {
    const subtotal = cart.reduce((acc, item) => {
      const price = item.product?.salePrice || item.product?.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);

    const discountAmount = Math.round(subtotal * (discountPercentage / 100));
    const amountAfterDiscount = subtotal - discountAmount;
    
    // 10% VAT on item total after discount
    const vatAmount = Math.round(amountAfterDiscount * 0.10);

    const isOnlyDigital = cart.length > 0 && cart.every(
      item => item.product?.type === 'pdf' || item.product?.type === 'audio' || item.product?.type === 'course'
    );
    
    // Shipping fee is 290,000 Toman, or FREE (0) if subtotal >= 2,000,000 Toman or digital-only
    const shippingFee = (subtotal >= 2000000 || isOnlyDigital || cart.length === 0) ? 0 : 290000;
    
    const grandTotal = amountAfterDiscount + vatAmount + shippingFee;

    // Generate order ID
    const randomId = 'IRN-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: randomId,
      date: new Date().toLocaleDateString('fa-IR'),
      status: 'pending',
      items: cart.map((item) => ({
        productId: item.product?.id || ('prod-' + Date.now()),
        title: item.product?.title || 'محصول',
        quantity: item.quantity || 1,
        price: item.product?.salePrice || item.product?.price || 0,
        type: item.product?.type || 'printed'
      })),
      subtotal,
      discountAmount,
      vatAmount,
      shippingFee,
      totalAmount: grandTotal,
      shippingAddress,
      trackingCode: undefined,
      paymentGateway: gateway,
      couponUsed: couponCode || undefined
    };

    // If first purchase discount was used, save flag to prevent second usage
    if (couponCode && ['DREAM20', 'FIRST20', 'WELCOME20'].includes(couponCode.toUpperCase())) {
      try {
        localStorage.setItem('40gates_first_purchase_used', 'true');
      } catch (e) {
        console.error(e);
      }
    }

    setOrders((prev) => [newOrder, ...prev]);

    // Save order to server endpoint
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      }).catch(err => console.warn('Order server sync err:', err));
    } catch (e) {
      console.warn('Order server sync exception:', e);
    }

    return newOrder;
  };

  // Update existing order status
  const updateOrderStatus = (orderId: string, status: Order['status'], trackingCode?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            trackingCode: trackingCode || o.trackingCode
          };
        }
        return o;
      })
    );

    // Sync status change to server endpoint
    try {
      fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, trackingCode })
      }).catch(err => console.warn('Order status server sync err:', err));
    } catch (e) {
      console.warn('Order status server sync exception:', e);
    }
  };

  // Coupon handling with 1-time check and 1,000,000 Toman minimum threshold
  const applyCoupon = (code: string, currentSubtotal: number = 0): { success: boolean; message: string } => {
    const formatted = code.toUpperCase().trim();

    if (['DREAM20', 'FIRST20', 'WELCOME20'].includes(formatted)) {
      // Check 1-time usage restriction
      const isUsed = localStorage.getItem('40gates_first_purchase_used') === 'true';
      if (isUsed) {
        return {
          success: false,
          message: 'این کد تخفیف مخصوص اولین خرید بوده و قبلاً توسط شما استفاده شده است.'
        };
      }

      // Check minimum subtotal threshold of 1,000,000 Toman
      if (currentSubtotal < 1000000) {
        return {
          success: false,
          message: 'کد تخفیف ۲۰٪ اولین خرید فقط برای خریدهای بالای ۱,۰۰۰,۰۰۰ تومان قابل استفاده است.'
        };
      }

      setCouponCode(formatted);
      setDiscountPercentage(20);
      return {
        success: true,
        message: 'کد تخفیف ۲۰٪ اولین خرید با موفقیت اعمال شد!'
      };
    }

    if (formatted === 'BEDAR40') {
      setCouponCode('BEDAR40');
      setDiscountPercentage(40);
      return {
        success: true,
        message: 'کد تخفیف ۴۰٪ با موفقیت اعمال گردید!'
      };
    }

    return {
      success: false,
      message: 'کد تخفیف وارد شده معتبر نمی‌باشد.'
    };
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountPercentage(0);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedProductId,
        setSelectedProductId: (id) => {
          setSelectedProductId(id);
          if (id) {
            window.location.hash = `product/${id}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        selectedArticleId,
        setSelectedArticleId: (id) => {
          setSelectedArticleId(id);
          if (id) {
            window.location.hash = `blog/${id}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        lastAddedItem,
        closeCartDrawer,
        wishlist,
        toggleWishlist,
        recentlyViewed,
        addToRecentlyViewed,
        userProfile,
        updateUserProfile,
        isAuthenticated,
        login,
        register,
        logout,
        orders,
        placeOrder,
        updateOrderStatus,
        refreshOrdersAndUsers,
        trackOrderId,
        setTrackOrderId: (id) => {
          setTrackOrderId(id);
          if (id) {
            window.location.hash = `track/${id}`;
          }
        },
        searchQuery,
        setSearchQuery,
        couponCode,
        discountPercentage,
        applyCoupon,
        removeCoupon,
        products,
        updateProduct,
        addProduct,
        deleteProduct,
        resetProducts
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
