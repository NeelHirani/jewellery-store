const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/admin/ContactManagement.tsx',
  'src/admin/Dashboard.tsx',
  'src/admin/EditProduct.tsx',
  'src/admin/OrderManagement.tsx',
  'src/admin/ProductForm.tsx',
  'src/admin/ProductList.tsx',
  'src/admin/ReviewManagement.tsx',
  'src/admin/UserManagement.tsx',
  'src/pages/Cart.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/Contact.tsx',
  'src/pages/EditAddress.tsx',
  'src/pages/ForgetPassword.tsx',
  'src/pages/Home.tsx',
  'src/pages/ProductDetail.tsx',
  'src/pages/Products.tsx',
  'src/pages/Profile.tsx',
  'src/components/LoadingScreen.tsx'
];

function fixParameterTypes(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Add parameter types for common patterns
    content = content.replace(
      /const (\w+) = \(([^)]*)\): void => \{/g,
      (match, funcName, params) => {
        if (params.includes(',') && !params.includes(':')) {
          // Multiple parameters without types
          if (funcName.includes('update') || funcName.includes('handle')) {
            return match.replace(
              `(${params}): void =>`,
              `(${params.split(',').map((p, i) => `${p.trim()}: any`).join(', ')}): void =>`
            );
          }
        } else if (params && !params.includes(':')) {
          // Single parameter without type
          if (funcName.includes('handle') || funcName.includes('update') || funcName.includes('delete')) {
            return match.replace(`(${params}): void =>`, `(${params.trim()}: any): void =>`);
          }
        }
        return match;
      }
    );
    
    // Fix 2: Add parameter types for async functions
    content = content.replace(
      /const (\w+) = async \(([^)]*)\) => \{/g,
      (match, funcName, params) => {
        if (params && !params.includes(':')) {
          if (funcName.includes('fetch') || funcName.includes('update') || funcName.includes('delete')) {
            return match.replace(`(${params})`, `(${params.trim()}: any)`);
          }
        }
        return match;
      }
    );
    
    // Fix 3: Fix function return types that should return void but marked as ReactElement
    content = content.replace(
      /const (\w+) = \([^)]*\): React\.ReactElement => \{[\s\S]*?\}/g,
      (match, funcName) => {
        // If function doesn't contain return statement with JSX, change to void
        if (!match.includes('return (') && !match.includes('return <') && !match.includes('return\n')) {
          return match.replace(': React.ReactElement =>', ': void =>');
        }
        return match;
      }
    );
    
    // Fix 4: Fix functions that return null but marked as ReactElement
    content = content.replace(
      /const (\w+) = \([^)]*\): React\.ReactElement => \{[\s\S]*?return null;[\s\S]*?\}/g,
      (match) => match.replace(': React.ReactElement =>', ': React.ReactElement | null =>')
    );
    
    // Fix 5: Fix binding element types
    content = content.replace(
      /const (\w+) = \(\{ ([^}]+) \}\) => \(/g,
      (match, funcName, params) => {
        if (!params.includes(':')) {
          const typedParams = params.split(',').map(p => {
            const paramName = p.trim();
            if (paramName === 'Icon') return 'icon: Icon';
            if (paramName === 'className') return 'className: string';
            if (paramName === 'title') return 'title: string';
            if (paramName === 'value') return 'value: string | number';
            if (paramName === 'color') return 'color: string';
            if (paramName === 'link') return 'link: string';
            return `${paramName}: any`;
          }).join(', ');
          return match.replace(`{ ${params} }`, `{ ${typedParams} }`);
        }
        return match;
      }
    );
    
    // Fix 6: Fix prev parameter in setState callbacks
    content = content.replace(
      /\(prev\) => \(/g,
      '(prev: any) => ('
    );
    
    // Fix 7: Fix event handler parameters
    content = content.replace(
      /const (\w+) = \(e\): void => \{/g,
      (match, funcName) => {
        if (funcName.includes('Submit') || funcName.includes('Form')) {
          return match.replace('(e): void =>', '(e: React.FormEvent): void =>');
        } else if (funcName.includes('Change') || funcName.includes('Input')) {
          return match.replace('(e): void =>', '(e: React.ChangeEvent<HTMLInputElement>): void =>');
        } else if (funcName.includes('Click')) {
          return match.replace('(e): void =>', '(e: React.MouseEvent): void =>');
        }
        return match.replace('(e): void =>', '(e: any): void =>');
      }
    );
    
    // Fix 8: Fix map callback parameters
    content = content.replace(
      /\.map\(\((\w+), (\w+)\) => \(/g,
      '.map(($1: any, $2: number) => ('
    );
    
    content = content.replace(
      /\.map\(\((\w+)\) => \(/g,
      '.map(($1: any) => ('
    );
    
    // Fix 9: Fix specific common parameter names
    content = content.replace(/\(id\): void =>/g, '(id: string): void =>');
    content = content.replace(/\(status\): string =>/g, '(status: string): string =>');
    content = content.replace(/\(rating\): React\.ReactElement =>/g, '(rating: number): React.ReactElement =>');
    content = content.replace(/\(productId\): React\.ReactElement =>/g, '(productId: string): void =>');
    
    // Fix 10: Remove unused imports (basic cleanup)
    const unusedImports = ['FaEye', 'FaEdit', 'FaTrash', 'FaPlus', 'FaCheck', 'FaUser', 'FaPhone', 'FaEnvelope', 'FaGift', 'FaUserCheck', 'FaUserTimes', 'Link'];
    
    unusedImports.forEach(importName => {
      const regex = new RegExp(`\\s*,?\\s*${importName}\\s*,?`, 'g');
      content = content.replace(regex, (match) => {
        // Only remove if it's clearly unused (not referenced elsewhere)
        const lines = content.split('\n');
        const importLine = lines.find(line => line.includes(`import`) && line.includes(importName));
        if (importLine && !content.includes(`<${importName}`) && !content.includes(`${importName}(`)) {
          return match.replace(importName, '').replace(/,\s*,/g, ',').replace(/,\s*}/g, '}').replace(/{\s*,/g, '{');
        }
        return match;
      });
    });
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content);
    
    console.log(`✓ Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('🔧 Starting parameter type fixes...\n');

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixParameterTypes(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 Parameter type fixes completed!');
console.log('📝 Run "npx tsc --noEmit --skipLibCheck" to check remaining errors');
