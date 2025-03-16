# Customizable Hat Implementation Notes

## Overview

This document outlines the implementation details for the Customizable Hat feature, including all changes made to the codebase and instructions for adding hat images.

## Changes Made

### Backend Implementation

#### 1. Cart Fragment (`lib/shopify/fragments/cart.ts`)

- Added support for line item attributes in the cart fragment to store customization text.
- Ensured attributes are included in the GraphQL query with `key` and `value` fields.

#### 2. Types (`lib/shopify/types.ts`)

- Updated `CartItem` type to include optional `attributes` array.
- Modified `ShopifyAddToCartOperation` and `ShopifyCreateCartOperation` types to support line item attributes.

#### 3. Shopify API Functions (`lib/shopify/index.ts`)

- Enhanced `addToCart` and `createCart` functions to accept and pass line item attributes to Shopify.

### Frontend Implementation

#### 1. Product Context (`components/product/product-context.tsx`)

- Added support for customization state in the product context.
- Implemented `updateCustomization` method to update customization text.
- Added URL parameter handling for customization text to persist state.

#### 2. Customization Components

- Created `HatPreview` component (`components/product/hat-preview.tsx`) for real-time visualization.
- Created `TextCustomizationInput` component (`components/product/text-customization-input.tsx`) for text input with validation.
- Created `CustomizeHatModal` component (`components/product/customize-hat-modal.tsx`) for the customization interface.

#### 3. Product Description (`components/product/product-description.tsx`)

- Added customization button for the "Customizable Hat" product.
- Added display of current customization text when available.
- Integrated the customization modal.

#### 4. Add to Cart (`components/cart/add-to-cart.tsx`)

- Updated to include customization attributes when adding to cart.
- Added validation to ensure customization is provided for the hat product.
- Modified button state to indicate when customization is required.

#### 5. Cart Context (`components/cart/cart-context.tsx`)

- Updated to handle attributes in cart items.
- Ensured attributes are preserved when updating cart items.

#### 6. Styling (`app/globals.css`)

- Added `.hat-text` class for styling the customized text on hats.
- Imported Roboto font for consistent text appearance.

## Hat Images Implementation Guide

### Where to Add Hat Images

Hat images should be added to a new directory: `/public/images/hats/`. Create this directory structure if it doesn't exist yet.

```
public/
  images/
    hats/
      classic/
        red.png
        blue.png
        black.png
        white.png
        gray.png
      trucker/
        red.png
        blue.png
        black.png
        white.png
        gray.png
      beanie/
        red.png
        blue.png
        black.png
        white.png
        gray.png
```

### Required Hat Styles and Colors

#### Hat Styles

1. **Classic Cap** - A traditional baseball cap with a curved brim
2. **Trucker Cap** - A cap with a foam front and mesh back
3. **Beanie** - A close-fitting knitted cap

#### Hat Colors

1. **Red** (#FF5555)
2. **Blue** (#5555FF)
3. **Black** (#333333)
4. **White** (#FFFFFF)
5. **Gray** (#AAAAAA)

### Image Requirements

- All images should be transparent PNG files (with alpha channel for background transparency)
- Recommended size: 500x500 pixels
- Consistent positioning across all styles to ensure text overlay appears in the correct position
- Filename format: `[color].png` (e.g., `red.png`, `blue.png`)

### Updating the HatPreview Component

Once you have the hat images, update the `HatPreview` component to use the actual images instead of the placeholder:

```typescript
// In components/product/hat-preview.tsx
export function HatPreview({
  color,
  style,
  textLine1,
  textLine2,
}: {
  color: string;
  style: string;
  textLine1: string;
  textLine2?: string;
}) {
  const hatStyle = useMemo(() => {
    return style?.toLowerCase() || 'classic';
  }, [style]);

  const hatColor = useMemo(() => {
    return color?.toLowerCase() || 'black';
  }, [color]);

  // Image path based on style and color
  const imagePath = `/images/hats/${hatStyle}/${hatColor}.png`;

  // Determine text position based on hat style
  const textPosition = useMemo(() => {
    switch (hatStyle) {
      case 'trucker':
        return 'top-1/3';
      case 'beanie':
        return 'top-1/2';
      case 'classic':
      default:
        return 'top-1/2';
    }
  }, [hatStyle]);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Hat image */}
        <div className="relative h-48 w-48">
          <img
            src={imagePath}
            alt={`${color} ${style} hat`}
            className="h-full w-full object-contain"
          />

          {/* Text overlay */}
          <div
            className={`absolute inset-x-0 ${textPosition} flex flex-col items-center justify-center p-4`}
          >
            {textLine1 && (
              <p className="hat-text text-center text-xl font-bold text-black dark:text-white">
                {textLine1}
              </p>
            )}
            {textLine2 && (
              <p className="hat-text mt-1 text-center text-xl font-bold text-black dark:text-white">
                {textLine2}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Next Steps

1. Create and add the hat images as specified above
2. Test the customization flow from end to end
3. Verify that customization data is correctly passed to Shopify
4. Test the feature on different devices and screen sizes
