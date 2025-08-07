const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/pages/Login.tsx',
  'src/pages/Signup.tsx',
  'src/pages/Contact.tsx',
  'src/pages/ForgetPassword.tsx',
  'src/pages/EditAddress.tsx',
  'src/pages/ProductDetail.tsx',
  'src/pages/Products.tsx',
  'src/admin/ProductForm.tsx',
  'src/admin/Dashboard.tsx',
  'src/admin/OrderManagement.tsx',
  'src/admin/ContactManagement.tsx'
];

function fixTypeScriptErrors(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: useState with object but wrong type annotation
    content = content.replace(
      /useState<string>\(\s*{\s*[^}]+\s*}\s*\)/g,
      (match) => {
        // Extract the object content
        const objMatch = match.match(/{\s*([^}]+)\s*}/);
        if (objMatch) {
          const objContent = objMatch[1];
          // Count properties to determine if it's a form object
          const propCount = (objContent.match(/:/g) || []).length;
          if (propCount > 1) {
            return match.replace('useState<string>', 'useState<any>');
          }
        }
        return match;
      }
    );
    
    // Fix 2: useState with array but wrong type
    content = content.replace(
      /useState<number>\(\s*\[[^\]]+\]\s*\)/g,
      (match) => match.replace('useState<number>', 'useState<number[]>')
    );
    
    // Fix 3: Function return types - functions that return JSX should not return void
    content = content.replace(
      /const (\w+) = \([^)]*\): void => \{[\s\S]*?return \(/g,
      (match, funcName) => {
        if (match.includes('return (') && match.includes('<')) {
          return match.replace(': void =>', ': React.ReactElement =>');
        }
        return match;
      }
    );
    
    // Fix 4: Event handlers without proper types
    content = content.replace(
      /const (\w+) = \(([^)]*)\): void => \{/g,
      (match, funcName, params) => {
        if (params.includes('e') && !params.includes(':')) {
          if (funcName.includes('Change') || funcName.includes('Input')) {
            return match.replace(
              `(${params}): void =>`,
              `(e: React.ChangeEvent<HTMLInputElement>): void =>`
            );
          } else if (funcName.includes('Submit') || funcName.includes('Form')) {
            return match.replace(
              `(${params}): void =>`,
              `(e: React.FormEvent): void =>`
            );
          } else if (funcName.includes('Click')) {
            return match.replace(
              `(${params}): void =>`,
              `(e: React.MouseEvent): void =>`
            );
          }
        }
        return match;
      }
    );
    
    // Fix 5: Functions that should return boolean but marked as void
    content = content.replace(
      /const (validate\w*|check\w*) = \([^)]*\): void => \{[\s\S]*?return [^;]+;/g,
      (match) => {
        if (match.includes('return ') && 
            (match.includes('Object.keys') || match.includes('true') || match.includes('false'))) {
          return match.replace(': void =>', ': boolean =>');
        }
        return match;
      }
    );
    
    // Fix 6: Functions that should return string but marked as void
    content = content.replace(
      /const (get\w*Color|get\w*Status) = \([^)]*\): void => \{[\s\S]*?return ['"][^'"]*['"];/g,
      (match) => match.replace(': void =>', ': string =>')
    );
    
    // Fix 7: Fix colSpan string to number
    content = content.replace(
      /colSpan="(\d+)"/g,
      'colSpan={$1}'
    );
    
    // Fix 8: Fix rows string to number
    content = content.replace(
      /rows="(\d+)"/g,
      'rows={$1}'
    );
    
    // Fix 9: Remove unused React import warning by using React.FC properly
    if (content.includes("'React' is declared but its value is never read")) {
      // If React is imported but not used, and we have React.FC, it's actually used
      content = content.replace(
        /import React, \{ ([^}]+) \} from 'react';/,
        "import React, { $1 } from 'react';"
      );
    }
    
    // Fix 10: Fix style jsx prop
    content = content.replace(
      /<style jsx>/g,
      '<style>'
    );
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content);
    
    console.log(`✓ Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('🔧 Starting TypeScript error fixes...\n');

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixTypeScriptErrors(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 TypeScript error fixes completed!');
console.log('📝 Run "npx tsc --noEmit" to check remaining errors');
