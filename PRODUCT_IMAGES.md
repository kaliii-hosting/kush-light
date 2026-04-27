# Product Image Guidelines for 3D Shop

## Image Requirements

For the best display in the 3D shop hero section, product images should be:

1. **Format**: PNG with transparent background
2. **Size**: 400x500px (or similar aspect ratio)
3. **Background**: Completely transparent
4. **Content**: Just the product (jar, package, cartridge, etc.)

## How to Add Product Images

### Option 1: Upload to Firebase Storage
1. Upload your PNG images to Firebase Storage
2. Get the public URL
3. Use that URL when adding products in admin

### Option 2: Use External Image Hosting
1. Upload to services like:
   - Imgur (with direct image link)
   - Cloudinary
   - Your own CDN
2. Make sure to use the direct image URL (ends with .png)

### Option 3: Use Placeholder Images
For testing, you can use these transparent PNG sources:
- https://placehold.co/400x500/000000/FFFFFF/png?text=Product
- https://via.placeholder.com/400x500.png

## Example Product Image URLs

Replace the imageUrl in products with URLs like:
```
imageUrl: "https://yourdomain.com/products/og-kush-jar.png"
imageUrl: "https://cdn.yourdomain.com/cartridge-blue-dream.png"
imageUrl: "https://firebasestorage.googleapis.com/v0/b/kushie-b69fb.appspot.com/o/products%2Fog-kush.png?alt=media"
```

## Tips for Best Results

1. **Remove backgrounds** from product photos using tools like:
   - remove.bg
   - Photoshop
   - Canva Pro

2. **Consistent sizing**: Keep all product images similar in dimensions

3. **High quality**: Use at least 400px width for clarity

4. **Proper naming**: Use descriptive filenames like "blue-dream-eighth.png"

The 3D shop will display these images floating on the counter with:
- No background (transparent)
- Hover glow effect
- Drop shadow for depth
- Click to view product details