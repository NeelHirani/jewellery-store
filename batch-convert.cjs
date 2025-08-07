const fs = require('fs');
const path = require('path');

// Files to convert
const filesToConvert = [
  // Pages
  'src/pages/About.jsx',
  'src/pages/Cart.jsx',
  'src/pages/Checkout.jsx',
  'src/pages/Contact.jsx',
  'src/pages/EditAddress.jsx',
  'src/pages/ForgetPassword.jsx',
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
    console.log(`Converting: ${filePath}`);
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    let convertedContent = content;
    
    // Add React import if not present
    if (!content.includes("import React")) {
      convertedContent = "import React from 'react';\n" + convertedContent;
    }
    
    // Convert export default function to const with React.FC
    convertedContent = convertedContent.replace(
      /export default function (\w+)\(\s*\)\s*{/g,
      'const $1: React.FC = () => {'
    );
    
    // Convert regular function declarations to const with React.FC
    convertedContent = convertedContent.replace(
      /^function (\w+)\(\s*\)\s*{/gm,
      'const $1: React.FC = () => {'
    );
    
    // Convert const function declarations to typed
    convertedContent = convertedContent.replace(
      /^const (\w+) = \(\) => {/gm,
      'const $1: React.FC = () => {'
    );
    
    // Add basic type annotations for useState
    convertedContent = convertedContent.replace(
      /useState\(([^)]*)\)/g,
      (match, p1) => {
        if (p1.includes('false') || p1.includes('true')) {
          return `useState<boolean>(${p1})`;
        } else if (p1.includes('0') || p1.includes('1') || p1.includes('2')) {
          return `useState<number>(${p1})`;
        } else if (p1.includes('""') || p1.includes("''")) {
          return `useState<string>(${p1})`;
        } else if (p1.includes('[]')) {
          return `useState<any[]>(${p1})`;
        } else if (p1.includes('null')) {
          return `useState<any>(${p1})`;
        } else {
          return `useState<any>(${p1})`;
        }
      }
    );
    
    // Add return type for event handlers
    convertedContent = convertedContent.replace(
      /const (\w+) = \(([^)]*)\) => {/g,
      (match, funcName, params) => {
        if (params.includes('event') || params.includes('e')) {
          return `const ${funcName} = (${params}): void => {`;
        } else if (params === '') {
          return `const ${funcName} = (): void => {`;
        } else {
          return `const ${funcName} = (${params}): void => {`;
        }
      }
    );
    
    // Fix closing brace and add export if needed
    const fileName = path.basename(filePath, '.jsx');
    if (convertedContent.includes('export default function')) {
      // Already has export, just need to fix the function declaration
      convertedContent = convertedContent.replace(
        /export default function (\w+)/,
        'const $1: React.FC ='
      );
      convertedContent += `\n\nexport default ${fileName};`;
    } else if (!convertedContent.includes('export default')) {
      // Add export at the end
      convertedContent = convertedContent.replace(/^}$/m, '};');
      convertedContent += `\n\nexport default ${fileName};`;
    } else {
      // Just fix the closing brace
      convertedContent = convertedContent.replace(/^}$/m, '};');
    }
    
    // Write the converted content
    fs.writeFileSync(filePath, convertedContent);
    
    // Rename file to .tsx
    const newPath = filePath.replace('.jsx', '.tsx');
    fs.renameSync(filePath, newPath);
    
    console.log(`✓ Converted: ${filePath} -> ${newPath}`);
    
  } catch (error) {
    console.error(`✗ Error converting ${filePath}:`, error.message);
  }
}

// Convert all files
console.log('🚀 Starting TypeScript conversion...\n');

filesToConvert.forEach(file => {
  if (fs.existsSync(file)) {
    convertFileToTypeScript(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 TypeScript conversion completed!');
console.log('\n📝 Next steps:');
console.log('   1. Install TypeScript dependencies: npm install');
console.log('   2. Fix any TypeScript compilation errors');
console.log('   3. Add proper interface definitions for props');
console.log('   4. Test the application');
