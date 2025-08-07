const fs = require('fs');

// Fix remaining issues
const fixes = [
  // Remove unused imports and variables
  {
    file: 'src/admin/AddCategory.tsx',
    replacements: [
      {
        from: 'const navigate = useNavigate();',
        to: '// const navigate = useNavigate(); // Unused'
      },
      {
        from: 'onClose(); // Close the modal on success',
        to: 'onClose?.(); // Close the modal on success'
      }
    ]
  },
  {
    file: 'src/admin/ContactManagement.tsx',
    replacements: [
      {
        from: '  FaCheck,',
        to: '  // FaCheck, // Unused'
      },
      {
        from: 'const [showBulkActions, setShowBulkActions] = useState<boolean>(false);',
        to: '// const [showBulkActions, setShowBulkActions] = useState<boolean>(false); // Unused'
      }
    ]
  },
  {
    file: 'src/admin/EditProduct.tsx',
    replacements: [
      {
        from: 'import React, { useState, useEffect } from \'react\';',
        to: 'import { useState, useEffect } from \'react\';'
      }
    ]
  },
  {
    file: 'src/admin/OrderManagement.tsx',
    replacements: [
      {
        from: 'const validateOrderSequence = async () => {',
        to: '// const validateOrderSequence = async () => { // Unused'
      },
      {
        from: 'e.target.src = \'/placeholder-image.jpg\';',
        to: '(e.target as HTMLImageElement).src = \'/placeholder-image.jpg\';'
      }
    ]
  },
  {
    file: 'src/admin/ProductForm.tsx',
    replacements: [
      {
        from: 'import { FaSave, FaArrowLeft, FaImage, FaTimes } from \'react-icons/fa\';',
        to: 'import { FaArrowLeft, FaImage, FaTimes } from \'react-icons/fa\';'
      }
    ]
  },
  {
    file: 'src/admin/Sidebar.tsx',
    replacements: [
      {
        from: 'import { Link, useLocation, useNavigate } from \'react-router-dom\';',
        to: 'import { useLocation, useNavigate } from \'react-router-dom\';'
      },
      {
        from: 'const [isCollapsed, setIsCollapsed] = useState<boolean>(false);',
        to: 'const [isCollapsed] = useState<boolean>(false); // setIsCollapsed unused'
      },
      {
        from: 'if (item.subItems) return;',
        to: 'if ((item as any).subItems) return;'
      },
      {
        from: '{item.subItems && !isCollapsed && isActiveRoute(item.path) && (',
        to: '{(item as any).subItems && !isCollapsed && isActiveRoute(item.path) && ('
      },
      {
        from: '{(item as any).subItems.map((subItem: any) => (',
        to: '{((item as any).subItems || []).map((subItem: any) => ('
      },
      {
        from: 'onClick={() => setIsMobileOpen(!isMobileOpen)}',
        to: 'onClick={() => setIsMobileOpen?.(!isMobileOpen)}'
      },
      {
        from: 'onClick={() => setIsMobileOpen(false)}',
        to: 'onClick={() => setIsMobileOpen?.(false)}'
      }
    ]
  },
  {
    file: 'src/admin/UserManagement.tsx',
    replacements: [
      {
        from: 'import { FaSearch, FaCheck, FaTimes } from \'react-icons/fa\';',
        to: 'import { FaSearch } from \'react-icons/fa\';'
      },
      {
        from: 'const handleViewUser = async (user: any) => {',
        to: '// const handleViewUser = async (user: any) => { // Unused'
      }
    ]
  },
  {
    file: 'src/pages/Cart.tsx',
    replacements: [
      {
        from: 'const updateSize = (id: any, newSize: any): void => {',
        to: '// const updateSize = (id: any, newSize: any): void => { // Unused'
      }
    ]
  },
  {
    file: 'src/pages/Home.tsx',
    replacements: [
      {
        from: 'interface Category {',
        to: '// interface Category { // Unused'
      },
      {
        from: 'categories[activeCatIndex].title',
        to: 'categories[activeCatIndex]?.title'
      },
      {
        from: 'categories[activeCatIndex].image',
        to: 'categories[activeCatIndex]?.image'
      },
      {
        from: 'slideData[current].heading',
        to: 'slideData[current]?.heading'
      },
      {
        from: 'slideData[current].description',
        to: 'slideData[current]?.description'
      },
      {
        from: 'dealsData[dealIndex].title',
        to: 'dealsData[dealIndex]?.title'
      },
      {
        from: 'dealsData[dealIndex].price',
        to: 'dealsData[dealIndex]?.price'
      }
    ]
  },
  {
    file: 'src/pages/Products.tsx',
    replacements: [
      {
        from: 'const [searchQuery, setSearchQuery] = useState<string>(\'\');',
        to: 'const [searchQuery] = useState<string>(\'\'); // setSearchQuery unused'
      },
      {
        from: 'priceRange[0]',
        to: 'priceRange[0]!'
      },
      {
        from: 'priceRange[1]',
        to: 'priceRange[1]!'
      },
      {
        from: 'new Date(b.created_at) - new Date(a.created_at)',
        to: 'new Date(b.created_at).getTime() - new Date(a.created_at).getTime()'
      }
    ]
  },
  {
    file: 'src/pages/Profile.tsx',
    replacements: [
      {
        from: 'import {\\n  FaUser,\\n  FaPhone,\\n  FaEnvelope,\\n  FaMapMarkerAlt,\\n  FaEdit,\\n  FaGift,',
        to: 'import {\\n  FaMapMarkerAlt,\\n  FaEdit,'
      },
      {
        from: 'const [activeTab, setActiveTab] = useState<any>(\'overview\');',
        to: '// const [activeTab, setActiveTab] = useState<any>(\'overview\'); // Unused'
      }
    ]
  },
  {
    file: 'src/pages/Signup.tsx',
    replacements: [
      {
        from: 'const { data, error } = await supabase.from("users").insert([',
        to: 'const { error } = await supabase.from("users").insert(['
      }
    ]
  },
  {
    file: 'src/pages/ProductDetail.tsx',
    replacements: [
      {
        from: 'if (e.key === \'user\') {',
        to: 'if ((e as any).key === \'user\') {'
      },
      {
        from: 'window.addEventListener(\'storage\', handleStorageChange);',
        to: 'window.addEventListener(\'storage\', handleStorageChange as any);'
      },
      {
        from: 'window.removeEventListener(\'storage\', handleStorageChange);',
        to: 'window.removeEventListener(\'storage\', handleStorageChange as any);'
      },
      {
        from: 'onChange={handleCommentChange}',
        to: 'onChange={(e) => handleCommentChange(e as any)}'
      }
    ]
  }
];

function applyFixes() {
  console.log('🔧 Starting remaining issue fixes...\n');
  
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
          content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
          console.log(`  ✓ Fixed: ${from.substring(0, 50)}...`);
        }
      });
      
      fs.writeFileSync(file, content);
      console.log(`✓ Completed: ${file}\n`);
      
    } catch (error) {
      console.error(`✗ Error fixing ${file}:`, error.message);
    }
  });
  
  console.log('🎉 Remaining issue fixes completed!');
}

applyFixes();
