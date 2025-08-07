const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/admin/ContactManagement.tsx',
  'src/admin/EditProduct.tsx',
  'src/admin/OrderManagement.tsx',
  'src/admin/ProductForm.tsx',
  'src/admin/ProductList.tsx',
  'src/admin/ReviewManagement.tsx',
  'src/admin/Sidebar.tsx',
  'src/pages/Contact.tsx',
  'src/pages/Login.tsx',
  'src/pages/Signup.tsx',
  'src/pages/ProductDetail.tsx',
  'src/pages/Products.tsx'
];

function fixRemainingErrors(filePath) {
  try {
    console.log(`Fixing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Functions that return JSX but marked as void
    content = content.replace(
      /const (\w+) = \([^)]*\): void => \{[\s\S]*?return \s*\(/g,
      (match, funcName) => {
        if (match.includes('return (') || match.includes('return<')) {
          return match.replace(': void =>', ': React.ReactElement =>');
        }
        return match;
      }
    );
    
    // Fix 2: Functions that return boolean but marked as void
    content = content.replace(
      /const (validate\w*|check\w*|is\w*) = \([^)]*\): void => \{[\s\S]*?return [^;]+;/g,
      (match) => {
        if (match.includes('return ') && 
            (match.includes('Object.keys') || match.includes('true') || match.includes('false') || match.includes('==='))) {
          return match.replace(': void =>', ': boolean =>');
        }
        return match;
      }
    );
    
    // Fix 3: Functions that return string but marked as void
    content = content.replace(
      /const (get\w*Color|get\w*Status|render\w*) = \([^)]*\): void => \{[\s\S]*?return ['"][^'"]*['"];/g,
      (match) => match.replace(': void =>', ': string =>')
    );
    
    // Fix 4: Functions that return JSX elements but marked as void
    content = content.replace(
      /const (render\w*|get\w*Icon) = \([^)]*\): void => \{[\s\S]*?return [^;]*</g,
      (match) => match.replace(': void =>', ': React.ReactElement =>')
    );
    
    // Fix 5: Fix colSpan string to number
    content = content.replace(/colSpan="(\d+)"/g, 'colSpan={$1}');
    
    // Fix 6: Fix rows string to number
    content = content.replace(/rows="(\d+)"/g, 'rows={$1}');
    
    // Fix 7: Fix maxLength string to number
    content = content.replace(/maxLength="(\d+)"/g, 'maxLength={$1}');
    
    // Fix 8: Fix allowFullScreen string to boolean
    content = content.replace(/allowFullScreen=""/g, 'allowFullScreen={true}');
    
    // Fix 9: Fix style jsx prop
    content = content.replace(/<style jsx>/g, '<style>');
    
    // Fix 10: Add proper event handler types
    content = content.replace(
      /const (\w+) = \(([^)]*)\): void => \{/g,
      (match, funcName, params) => {
        if (params.includes('e') && !params.includes(':')) {
          if (funcName.toLowerCase().includes('change') || funcName.toLowerCase().includes('input')) {
            return match.replace(
              `(${params}): void =>`,
              `(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void =>`
            );
          } else if (funcName.toLowerCase().includes('submit') || funcName.toLowerCase().includes('form')) {
            return match.replace(
              `(${params}): void =>`,
              `(e: React.FormEvent): void =>`
            );
          } else if (funcName.toLowerCase().includes('click')) {
            return match.replace(
              `(${params}): void =>`,
              `(e: React.MouseEvent): void =>`
            );
          }
        }
        return match;
      }
    );
    
    // Fix 11: Fix useState with wrong object types
    content = content.replace(
      /useState<(string|number)>\(\s*{\s*[^}]+\s*}\s*\)/g,
      (match) => {
        return match.replace(/useState<(string|number)>/, 'useState<any>');
      }
    );
    
    // Fix 12: Remove unused imports (basic cleanup)
    const unusedImports = [
      'FaEye', 'FaEdit', 'FaTrash', 'FaPlus', 'FaCheck', 'FaFilter', 
      'FaDownload', 'FaUser', 'FaPhone', 'FaEnvelope', 'FaGift',
      'FaUserCheck', 'FaUserTimes', 'AnimatePresence', 'Link'
    ];
    
    unusedImports.forEach(importName => {
      // Remove from import statements if it appears to be unused
      const importRegex = new RegExp(`\\s*,?\\s*${importName}\\s*,?`, 'g');
      content = content.replace(importRegex, (match) => {
        // Only remove if it's in an import statement and not used elsewhere
        if (content.split('\n')[0].includes('import') && 
            !content.includes(`<${importName}`) && 
            !content.includes(`${importName}(`)) {
          return match.replace(importName, '').replace(/,\s*,/g, ',').replace(/,\s*}/g, '}');
        }
        return match;
      });
    });
    
    // Fix 13: Fix error.message access on unknown type
    content = content.replace(
      /error\.message/g,
      '(error as Error).message'
    );
    
    // Fix 14: Fix err.message access on unknown type
    content = content.replace(
      /err\.message/g,
      '(err as Error).message'
    );
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content);
    
    console.log(`✓ Fixed: ${filePath}`);
    
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('🔧 Starting remaining TypeScript error fixes...\n');

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    fixRemainingErrors(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 Remaining TypeScript error fixes completed!');
console.log('📝 Run "npx tsc --noEmit --skipLibCheck" to check remaining errors');
