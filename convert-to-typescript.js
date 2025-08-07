const fs = require('fs');
const path = require('path');

// List of files to convert
const filesToConvert = [
  // Components
  'src/components/Footer.jsx',
  'src/components/LoadingScreen.jsx',
  'src/components/LoadingScreenDemo.jsx',
  'src/components/ScrollToTop.jsx',
  
  // Pages
  'src/pages/About.jsx',
  'src/pages/Cart.jsx',
  'src/pages/Checkout.jsx',
  'src/pages/Contact.jsx',
  'src/pages/EditAddress.jsx',
  'src/pages/ForgetPassword.jsx',
  'src/pages/Home.jsx',
  'src/pages/Login.jsx',
  'src/pages/PoliciesFaq.jsx',
  'src/pages/ProductDetail.jsx',
  'src/pages/Products.jsx',
  'src/pages/Profile.jsx',
  'src/pages/Signup.jsx',
  
  // Admin
  'src/admin/AddCategory.jsx',
  'src/admin/AdminRoute.jsx',
  'src/admin/ContactManagement.jsx',
  'src/admin/Dashboard.jsx',
  'src/admin/EditProduct.jsx',
  'src/admin/Login.jsx',
  'src/admin/OrderManagement.jsx',
  'src/admin/ProductForm.jsx',
  'src/admin/ProductList.jsx',
  'src/admin/ReviewManagement.jsx',
  'src/admin/Sidebar.jsx',
  'src/admin/UserManagement.jsx'
];

function convertFileToTypeScript(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic TypeScript conversions
    let convertedContent = content
      // Add React import if not present
      .replace(/^(?!.*import.*React)/m, "import React from 'react';\n")
      // Convert function declarations to typed
      .replace(/export default function (\w+)\(\)/g, 'const $1: React.FC = () =>')
      .replace(/function (\w+)\(\)/g, 'const $1: React.FC = () =>')
      // Add basic type annotations for useState
      .replace(/useState\(([^)]+)\)/g, 'useState<any>($1)')
      // Add return type for functions
      .replace(/const (\w+) = \(\) => {/g, 'const $1 = (): void => {')
      // Add export default at the end if it's a component
      .replace(/^export default function (\w+)/m, 'const $1: React.FC = ')
      // Fix export at the end
      .replace(/^}$/m, '};\n\nexport default ' + path.basename(filePath, '.jsx') + ';');
    
    // Write the converted content
    fs.writeFileSync(filePath, convertedContent);
    
    // Rename file to .tsx
    const newPath = filePath.replace('.jsx', '.tsx');
    fs.renameSync(filePath, newPath);
    
    console.log(`Converted: ${filePath} -> ${newPath}`);
    
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error.message);
  }
}

// Convert all files
filesToConvert.forEach(convertFileToTypeScript);

console.log('TypeScript conversion completed!');
