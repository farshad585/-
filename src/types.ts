/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;          // Persian Title
  englishTitle: string;   // English Subtitle
  description: string;    // Long description in Persian
  shortDescription: string;
  price: number;          // Price in Toman
  salePrice?: number;     // Sale price in Toman
  type: 'printed' | 'pdf' | 'audio' | 'course';
  category: 'books' | 'audiobooks' | 'courses' | 'tools';
  images: string[];       // Array of image placeholders or assets
  stock: number;          // 0 means out of stock
  rating: number;         // Average rating
  reviewsCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  tags: string[];
  pages?: number;         // For books
  duration?: string;      // For audiobooks / courses
  format?: string;        // e.g. "PDF", "MP3", "Hardcover"
  author: string;         // e.g. "Farshad" or "چهل دروازه"
  downloadUrl?: string;    // Direct downloadable file URL
  tableOfContents?: string[]; // Table of contents
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFormat?: string; // pdf, printed, audio
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or rich text
  image: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  slug: string;
  tags: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'dreaming' | 'orders' | 'downloads';
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    type: Product['type'];
  }[];
  subtotal?: number;
  discountAmount?: number;
  vatAmount?: number;
  shippingFee?: number;
  totalAmount: number;
  shippingAddress?: {
    fullName: string;
    phone: string;
    province: string;
    city: string;
    postalCode: string;
    address: string;
  };
  trackingCode?: string;
  paymentGateway: 'card-to-card' | 'zarinpal' | 'idpay';
  couponUsed?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  address: string;
  wishlist: string[]; // Product IDs
  recentlyViewed: string[]; // Product IDs
}
