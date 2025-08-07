const fs = require('fs');
const path = require('path');

// Files to fix with their specific parameter type issues
const fixes = [
  // Event handlers
  {
    file: 'src/pages/Contact.tsx',
    replacements: [
      {
        from: 'const handleSubmit = async (e) => {',
        to: 'const handleSubmit = async (e: React.FormEvent) => {'
      },
      {
        from: 'const toggleFaq = (faqId): void => {',
        to: 'const toggleFaq = (faqId: string | number): void => {'
      }
    ]
  },
  {
    file: 'src/pages/Login.tsx',
    replacements: [
      {
        from: 'const handleSubmit = async (e) => {',
        to: 'const handleSubmit = async (e: React.FormEvent) => {'
      }
    ]
  },
  {
    file: 'src/pages/Signup.tsx',
    replacements: [
      {
        from: 'const handleSubmit = async (e) => {',
        to: 'const handleSubmit = async (e: React.FormEvent) => {'
      }
    ]
  },
  {
    file: 'src/pages/ForgetPassword.tsx',
    replacements: [
      {
        from: 'const handleSubmit = async (e) => {',
        to: 'const handleSubmit = async (e: React.FormEvent) => {'
      }
    ]
  },
  {
    file: 'src/pages/EditAddress.tsx',
    replacements: [
      {
        from: 'const handleSave = async (e) => {',
        to: 'const handleSave = async (e: React.FormEvent) => {'
      }
    ]
  },
  {
    file: 'src/pages/ProductDetail.tsx',
    replacements: [
      {
        from: 'const handleQuantityChange = (change): void => {',
        to: 'const handleQuantityChange = (change: number): void => {'
      },
      {
        from: 'const toggleWishlist = (productId): void => {',
        to: 'const toggleWishlist = (productId: string): void => {'
      },
      {
        from: 'const handleReviewSubmit = async (e) => {',
        to: 'const handleReviewSubmit = async (e: React.FormEvent) => {'
      }
    ]
  },
  {
    file: 'src/pages/Products.tsx',
    replacements: [
      {
        from: 'const toggleWishlist = (productId): void => {',
        to: 'const toggleWishlist = (productId: string): void => {'
      },
      {
        from: 'const handleAddToCart = (product): void => {',
        to: 'const handleAddToCart = (product: any): void => {'
      }
    ]
  },
  {
    file: 'src/pages/Checkout.tsx',
    replacements: [
      {
        from: 'setState(prev => ({ ...prev, [name]: value }));',
        to: 'setState((prev: any) => ({ ...prev, [name]: value }));'
      }
    ]
  },
  {
    file: 'src/pages/Home.tsx',
    replacements: [
      {
        from: 'const handleChange = (e) => setPrefersReducedMotion(e.matches);',
        to: 'const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);'
      }
    ]
  },
  // Admin components
  {
    file: 'src/admin/ContactManagement.tsx',
    replacements: [
      {
        from: 'const updateStatus = async (id, newStatus: any) => {',
        to: 'const updateStatus = async (id: string, newStatus: any) => {'
      },
      {
        from: 'setSelectedSubmission(prev => ({ ...prev, status: newStatus }));',
        to: 'setSelectedSubmission((prev: any) => ({ ...prev, status: newStatus }));'
      },
      {
        from: 'const handleBulkStatusUpdate = async (newStatus) => {',
        to: 'const handleBulkStatusUpdate = async (newStatus: string) => {'
      },
      {
        from: 'const getPriorityIcon = (subject): React.ReactElement | null => {',
        to: 'const getPriorityIcon = (subject: string): React.ReactElement | null => {'
      }
    ]
  },
  {
    file: 'src/admin/OrderManagement.tsx',
    replacements: [
      {
        from: 'const updateOrderStatus = async (orderId, newStatus: any) => {',
        to: 'const updateOrderStatus = async (orderId: string, newStatus: any) => {'
      },
      {
        from: 'const handleViewOrder = async (order) => {',
        to: 'const handleViewOrder = async (order: any) => {'
      },
      {
        from: 'const handleDeleteOrder = (order): void => {',
        to: 'const handleDeleteOrder = (order: any): void => {'
      }
    ]
  },
  {
    file: 'src/admin/ProductList.tsx',
    replacements: [
      {
        from: 'const handleDeleteProduct = async (productId) => {',
        to: 'const handleDeleteProduct = async (productId: string) => {'
      }
    ]
  },
  {
    file: 'src/admin/ReviewManagement.tsx',
    replacements: [
      {
        from: 'const handleUpdateStatus = async (reviewId, newStatus) => {',
        to: 'const handleUpdateStatus = async (reviewId: string, newStatus: string) => {'
      },
      {
        from: 'const handleViewReview = (review): void => {',
        to: 'const handleViewReview = (review: any): void => {'
      }
    ]
  },
  {
    file: 'src/admin/Sidebar.tsx',
    replacements: [
      {
        from: 'const isActiveRoute = (path, exact = false): boolean => {',
        to: 'const isActiveRoute = (path: string, exact = false): boolean => {'
      },
      {
        from: 'const handleLogout = (): React.ReactElement => {',
        to: 'const handleLogout = (): void => {'
      },
      {
        from: '{item.subItems.map((subItem) => (',
        to: '{item.subItems.map((subItem: any) => ('
      }
    ]
  },
  {
    file: 'src/admin/UserManagement.tsx',
    replacements: [
      {
        from: 'const handleViewUser = async (user) => {',
        to: 'const handleViewUser = async (user: any) => {'
      },
      {
        from: '{user.name?.split(\' \').map(n => n[0]).join(\'\') || \'U\'}',
        to: '{user.name?.split(\' \').map((n: string) => n[0]).join(\'\') || \'U\'}'
      }
    ]
  },
  {
    file: 'src/admin/ProductForm.tsx',
    replacements: [
      {
        from: 'setErrors(prev => ({',
        to: 'setErrors((prev: FormErrors) => ({'
      },
      {
        from: 'const removeImage = (index): void => {',
        to: 'const removeImage = (index: number): void => {'
      },
      {
        from: 'const handleSubmit = async (e) => {',
        to: 'const handleSubmit = async (e: React.FormEvent) => {'
      }
    ]
  }
];

function applyFixes() {
  console.log('🔧 Starting parameter type fixes...\n');
  
  fixes.forEach(({ file, replacements }) => {
    try {
      if (!fs.existsSync(file)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
      }
      
      console.log(`Fixing: ${file}`);
      let content = fs.readFileSync(file, 'utf8');
      
      replacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
          content = content.replace(from, to);
          console.log(`  ✓ Fixed: ${from.substring(0, 50)}...`);
        }
      });
      
      fs.writeFileSync(file, content);
      console.log(`✓ Completed: ${file}\n`);
      
    } catch (error) {
      console.error(`✗ Error fixing ${file}:`, error.message);
    }
  });
  
  console.log('🎉 Parameter type fixes completed!');
}

applyFixes();
