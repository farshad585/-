/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GoftinoWidget from './components/GoftinoWidget';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Blog from './pages/Blog';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Legal from './pages/Legal';

function MainAppContent() {
  const { currentPage } = useApp();

  // Route Dispatcher
  const renderActivePage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'shop':
        return <Shop />;
      case 'product-details':
        return <ProductDetails />;
      case 'blog':
      case 'blog-details':
        return <Blog />;
      case 'faq':
        return <FAQ />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'dashboard':
      case 'tracking':
        return <Dashboard />;
      case 'legal':
        return <Legal />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-800 relative overflow-hidden geom-grid-bg">
      {/* Geometric lines background decoration */}
      <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 border-r border-t border-indigo-300/40 transform -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 border-l border-b border-purple-300/40 transform translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/4 left-10 w-24 h-24 border border-violet-400/20 rotate-45"></div>
        <div className="absolute bottom-1/4 right-10 w-36 h-36 border border-blue-400/20 -rotate-12"></div>
      </div>

      {/* Sticky Top Nav */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-12 relative z-10">
        {renderActivePage()}
      </main>

      {/* Bottom Footer */}
      <Footer />

      {/* Goftino Live Chat Widget */}
      <GoftinoWidget />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
