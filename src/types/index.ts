// Application Types

import { ReactNode } from 'react';
import { User, Product, Review, ContactSubmission, Order, OrderItem } from './database';

// Component Props Types
export interface LayoutProps {
  children: ReactNode;
}

export interface NavbarProps {
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface LoadingScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export interface ScrollToTopProps {
  smooth?: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image_base64?: string;
  additional_images?: string[];
  stock_quantity: number;
  is_featured: boolean;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface ReviewFormData {
  rating: number;
  comment?: string;
}

export interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

// Search and Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'name' | 'price' | 'created_at' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SearchParams {
  query: string;
  filters: ProductFilters;
  pagination: PaginationParams;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingReviews: number;
  newContacts: number;
}

export interface AdminFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

// Order Types
export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: Product;
  })[];
  user?: User;
}

export interface CheckoutData {
  items: CartItem[];
  shippingAddress: AddressFormData;
  paymentMethod: string;
  total: number;
}

// Review Types with Relations
export interface ReviewWithRelations extends Review {
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
  };
}

// Contact Types
export interface ContactWithStats extends ContactSubmission {
  responseTime?: number;
  isOverdue?: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Event Handler Types
export interface FormSubmitHandler<T = unknown> {
  (data: T): Promise<void> | void;
}

export interface ClickHandler {
  (event: React.MouseEvent<HTMLElement>): void;
}

export interface ChangeHandler {
  (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// Table Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationParams;
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Re-export database types
export * from './database';
