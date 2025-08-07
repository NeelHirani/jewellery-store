# PowerShell script to convert React JSX files to TypeScript TSX

# Define the files to convert
$filesToConvert = @(
    "src\components\Footer.jsx",
    "src\components\LoadingScreenDemo.jsx", 
    "src\components\ScrollToTop.jsx",
    "src\pages\About.jsx",
    "src\pages\Cart.jsx",
    "src\pages\Checkout.jsx",
    "src\pages\Contact.jsx",
    "src\pages\EditAddress.jsx",
    "src\pages\ForgetPassword.jsx",
    "src\pages\Home.jsx",
    "src\pages\Login.jsx",
    "src\pages\PoliciesFaq.jsx",
    "src\pages\ProductDetail.jsx",
    "src\pages\Products.jsx",
    "src\pages\Profile.jsx",
    "src\pages\Signup.jsx",
    "src\admin\AddCategory.jsx",
    "src\admin\AdminRoute.jsx",
    "src\admin\ContactManagement.jsx",
    "src\admin\Dashboard.jsx",
    "src\admin\EditProduct.jsx",
    "src\admin\Login.jsx",
    "src\admin\OrderManagement.jsx",
    "src\admin\ProductForm.jsx",
    "src\admin\ProductList.jsx",
    "src\admin\ReviewManagement.jsx",
    "src\admin\Sidebar.jsx",
    "src\admin\UserManagement.jsx"
)

function Convert-FileToTypeScript {
    param(
        [string]$FilePath
    )
    
    try {
        Write-Host "Converting: $FilePath"
        
        # Read the file content
        $content = Get-Content -Path $FilePath -Raw
        
        # Basic TypeScript conversions
        $convertedContent = $content
        
        # Add React import if not present
        if ($content -notmatch "import.*React.*from.*'react'") {
            $convertedContent = "import React from 'react';`n" + $convertedContent
        }
        
        # Convert function component declarations
        $convertedContent = $convertedContent -replace "export default function (\w+)\(\s*\)\s*{", 'const $1: React.FC = () => {'
        $convertedContent = $convertedContent -replace "function (\w+)\(\s*\)\s*{", 'const $1: React.FC = () => {'
        
        # Add basic type annotations for useState
        $convertedContent = $convertedContent -replace "useState\(([^)]+)\)", 'useState<any>($1)'
        $convertedContent = $convertedContent -replace "useState\(\)", 'useState<any>()'
        
        # Add return type annotations for simple functions
        $convertedContent = $convertedContent -replace "const (\w+) = \(\) => {", 'const $1 = (): void => {'
        $convertedContent = $convertedContent -replace "const (\w+) = \(([^)]*)\) => {", 'const $1 = ($2): void => {'
        
        # Fix export statements
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        if ($convertedContent -match "export default function") {
            $convertedContent = $convertedContent -replace "export default function (\w+)", 'const $1: React.FC = '
            $convertedContent += "`n`nexport default $fileName;"
        }
        
        # Write the converted content back
        Set-Content -Path $FilePath -Value $convertedContent
        
        # Rename file to .tsx
        $newPath = $FilePath -replace "\.jsx$", ".tsx"
        Rename-Item -Path $FilePath -NewName $newPath
        
        Write-Host "✓ Converted: $FilePath -> $newPath"
        
    } catch {
        Write-Error "✗ Error converting $FilePath : $($_.Exception.Message)"
    }
}

# Convert all files
foreach ($file in $filesToConvert) {
    if (Test-Path $file) {
        Convert-FileToTypeScript -FilePath $file
    } else {
        Write-Warning "File not found: $file"
    }
}

Write-Host "`n🎉 TypeScript conversion completed!"
Write-Host "📝 Next steps:"
Write-Host "   1. Run 'npm install' to install TypeScript dependencies"
Write-Host "   2. Fix any TypeScript compilation errors"
Write-Host "   3. Add proper type definitions for props and state"
Write-Host "   4. Test the application to ensure everything works"
