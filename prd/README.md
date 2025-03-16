# Customizable Hat Feature

## Overview

The Customizable Hat feature allows customers to personalize a hat by adding custom text and selecting variant options (color, style, size). This README provides an overview of the feature, its implementation, and how to work with it.

## Feature Highlights

- **Text Customization**: Customers can add up to two lines of text to their hat
- **Real-time Preview**: As customers type, they see a live preview of how their text will appear on the hat
- **Variant Selection**: Customers can choose color, style, and size options
- **Shopify Integration**: Custom text is stored as line item properties in Shopify orders

## Implementation Details

The feature is implemented using the following components:

1. **Customization Modal**: A dialog that appears when the customer clicks "Customize Hat"
2. **Text Input Fields**: Input fields for entering the custom text with validation
3. **Hat Preview**: A visual representation of the hat with the custom text overlay
4. **Product Context**: State management for the customization data
5. **Shopify Integration**: Line item properties for storing the custom text

## Directory Structure

```
lib/
  ├── types/
  │   └── customization.ts    # Customization type definitions
  ├── validation.ts           # Text validation utilities
  └── shopify/
      ├── fragments/
      │   └── cart.ts         # Updated cart fragment with attributes
      ├── mutations/
      │   └── cart.ts         # Cart mutations
      └── index.ts            # Updated cart functions

components/
  ├── product/
  │   ├── customize-hat-modal.tsx    # Customization modal
  │   ├── hat-preview.tsx            # Hat preview component
  │   ├── text-customization-input.tsx # Text input component
  │   ├── product-context.tsx        # Updated product context
  │   └── product-description.tsx    # Updated product description
  └── cart/
      ├── add-to-cart.tsx            # Updated add to cart component
      └── cart-context.tsx           # Updated cart context

public/
  └── images/
      └── hats/                      # Hat images for different styles
```

## How It Works

1. **Customer Journey**:

   - Customer navigates to the "Customizable Hat" product page
   - Customer selects variant options (color, style, size)
   - Customer clicks "Customize Hat" button
   - Customer enters text in the customization modal
   - Customer sees a real-time preview of their customization
   - Customer clicks "Save Customization"
   - Customer adds the product to their cart
   - Customer completes checkout

2. **Data Flow**:
   - Text customization is stored in the product context
   - When adding to cart, the text is converted to line item properties
   - Line item properties are sent to Shopify with the cart item
   - Order details in Shopify include the custom text

## For Developers

### Adding a New Hat Style

1. Add a new hat image to `public/images/hats/`
2. Update the hat style options in Shopify
3. Update the `HatPreview` component to handle the new style

### Modifying Text Constraints

1. Update the `validateCustomization` function in `lib/validation.ts`
2. Update the `maxLength` prop in the `TextCustomizationInput` component

## For Fulfillment Team

When processing orders with customized hats:

1. Look for line item properties in the Shopify order:

   - `line1_text`: First line of text (required)
   - `line2_text`: Second line of text (optional)

2. Apply the text to the hat according to the style guidelines:
   - Use the specified font and size
   - Position the text according to the hat style
   - Ensure both lines are centered

## Testing

The feature includes:

- Unit tests for text validation
- Component tests for the customization UI
- End-to-end tests for the complete customer journey

Run tests with:

```bash
npm test
```

## Troubleshooting

Common issues and solutions:

1. **Text not appearing in preview**: Check that the hat style is correctly selected and the preview component is rendering properly.

2. **Line item properties not showing in Shopify**: Verify that the cart mutations include the attributes and that the cart fragment is correctly updated.

3. **Validation errors**: Check the validation rules in `lib/validation.ts` and ensure they match the UI constraints.

## Future Enhancements

Planned improvements for future releases:

1. Font selection for customization text
2. Color selection for customization text
3. Position adjustment for text placement
4. Image upload for custom logos or graphics
