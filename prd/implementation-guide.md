# Customizable Hat Module - Technical Implementation Guide

## Overview

This document provides detailed technical guidance for implementing the Customizable Hat feature as outlined in the PRD. The implementation will allow users to personalize a hat by selecting color, style, size, and adding up to two lines of custom text.

## 1. Backend Implementation

### 1.1 Shopify GraphQL API Updates

#### 1.1.1 Update Cart Mutations

We need to modify the cart mutations to include line item properties for the customization text. Update the following files:

**File: `lib/shopify/mutations/cart.ts`**

Update the `addToCartMutation` and `createCartMutation` to include customAttributes:

```typescript
export const addToCartMutation = /* GraphQL */ `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cartFragment}
`;

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        ...cart
      }
    }
  }
  ${cartFragment}
`;
```

The `CartLineInput` in Shopify's API already supports `attributes`, so we don't need to modify the GraphQL queries themselves, but we need to update our TypeScript types and functions to handle these attributes.

#### 1.1.2 Update Cart Fragment

Update the cart fragment to include line item properties in the response:

**File: `lib/shopify/fragments/cart.ts`**

```typescript
const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                ...product
              }
            }
          }
        }
      }
    }
    totalQuantity
  }
  ${productFragment}
`;
```

### 1.2 Types and Interfaces

#### 1.2.1 Update Cart Types

**File: `lib/shopify/types.ts`**

Add line item properties to the CartItem type:

```typescript
export type CartItem = {
  id: string | undefined;
  quantity: number;
  attributes?: {
    key: string;
    value: string;
  }[];
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
      attributes?: {
        key: string;
        value: string;
      }[];
    }[];
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
  variables?: {
    lineItems?: {
      merchandiseId: string;
      quantity: number;
      attributes?: {
        key: string;
        value: string;
      }[];
    }[];
  };
};
```

#### 1.2.2 Create Customization Types

**File: `lib/types/customization.ts`** (new file)

```typescript
export type TextCustomization = {
  line1: string;
  line2?: string;
};

export type HatCustomization = TextCustomization & {
  color: string;
  style: string;
  size: string;
};
```

### 1.3 Cart Functions

#### 1.3.1 Update Add to Cart Function

**File: `lib/shopify/index.ts`**

Modify the `addToCart` function to accept line item properties:

```typescript
export async function addToCart(
  lines: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[]
): Promise<Cart> {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return createCart(lines);
  }

  const { data, status } = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
  });

  if (status === 404) {
    return createCart(lines);
  }

  if (data?.cartLinesAdd?.cart) {
    return reshapeCart(data.cartLinesAdd.cart);
  }

  return {} as Cart;
}
```

#### 1.3.2 Update Create Cart Function

```typescript
export async function createCart(
  lines?: {
    merchandiseId: string;
    quantity: number;
    attributes?: { key: string; value: string }[];
  }[]
): Promise<Cart> {
  const { data } = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    variables: {
      lineItems: lines,
    },
  });

  const cart = data.cartCreate.cart;
  const headers = new Headers();
  headers.append('Set-Cookie', `cartId=${cart.id}; Max-Age=2592000; Path=/`);

  return reshapeCart(cart);
}
```

## 2. Frontend Implementation

### 2.1 Product Context Extensions

#### 2.1.1 Update Product Context

**File: `components/product/product-context.tsx`**

Extend the ProductContext to include customization text state:

```typescript
import { TextCustomization } from 'lib/types/customization';

type ProductState = {
  [key: string]: string;
} & {
  image?: string;
  customization?: TextCustomization;
};

type ProductContextType = {
  state: ProductState;
  updateOption: (name: string, value: string) => ProductState;
  updateImage: (index: string) => ProductState;
  updateCustomization: (customization: TextCustomization) => ProductState;
};

// Update the ProductProvider component
export function ProductProvider({ children }: { children: React.ReactNode }) {
  // ... existing code ...

  const updateCustomization = (customization: TextCustomization) => {
    const newState = { customization };
    setOptimisticState(newState);
    return { ...state, ...newState };
  };

  const value = useMemo(
    () => ({
      state,
      updateOption,
      updateImage,
      updateCustomization
    }),
    [state]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
```

### 2.2 Customization Components

#### 2.2.1 Create Customization Modal Component

**File: `components/product/customize-hat-modal.tsx`** (new file)

```typescript
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useProduct } from './product-context';
import { TextCustomization } from 'lib/types/customization';
import { HatPreview } from './hat-preview';
import { TextCustomizationInput } from './text-customization-input';

export function CustomizeHatModal({
  isOpen,
  closeModal
}: {
  isOpen: boolean;
  closeModal: () => void;
}) {
  const { state, updateCustomization } = useProduct();
  const [textCustomization, setTextCustomization] = useState<TextCustomization>({
    line1: state.customization?.line1 || '',
    line2: state.customization?.line2 || ''
  });
  const [errors, setErrors] = useState<{ line1?: string }>({});

  const handleTextChange = (field: keyof TextCustomization, value: string) => {
    setTextCustomization((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user types in line1
    if (field === 'line1' && value && errors.line1) {
      setErrors({});
    }
  };

  const handleSave = () => {
    // Validate line1 is required
    if (!textCustomization.line1) {
      setErrors({ line1: 'Line 1 text is required' });
      return;
    }

    updateCustomization(textCustomization);
    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-black">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Customize Your Hat
                </Dialog.Title>
                <div className="mt-4">
                  <HatPreview
                    color={state.color || ''}
                    style={state.style || ''}
                    textLine1={textCustomization.line1}
                    textLine2={textCustomization.line2}
                  />
                </div>
                <div className="mt-4">
                  <TextCustomizationInput
                    label="Line 1 (Required)"
                    value={textCustomization.line1}
                    onChange={(value) => handleTextChange('line1', value)}
                    maxLength={20}
                    error={errors.line1}
                  />
                </div>
                <div className="mt-4">
                  <TextCustomizationInput
                    label="Line 2 (Optional)"
                    value={textCustomization.line2 || ''}
                    onChange={(value) => handleTextChange('line2', value)}
                    maxLength={20}
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleSave}
                  >
                    Save Customization
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
```

#### 2.2.2 Create Text Customization Input Component

**File: `components/product/text-customization-input.tsx`** (new file)

```typescript
'use client';

import { useState } from 'react';

export function TextCustomizationInput({
  label,
  value,
  onChange,
  maxLength,
  error
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className={`block w-full rounded-md border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm`}
        />
        <div className="mt-1 flex justify-between">
          <p className={`text-xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {error || `${value.length}/${maxLength} characters`}
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 2.2.3 Create Hat Preview Component

**File: `components/product/hat-preview.tsx`** (new file)

```typescript
'use client';

import Image from 'next/image';
import { useMemo } from 'react';

export function HatPreview({
  color,
  style,
  textLine1,
  textLine2
}: {
  color: string;
  style: string;
  textLine1: string;
  textLine2?: string;
}) {
  // In a real implementation, we would have different hat images for each color and style
  // For this example, we'll use a placeholder and apply color with CSS
  const hatImageSrc = useMemo(() => {
    // This would be replaced with actual logic to select the correct hat image
    return `/images/hats/${style || 'classic'}.png`;
  }, [style]);

  return (
    <div className="relative h-64 w-full">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: color || '#CCCCCC' }}
      >
        {/* This would be replaced with an actual hat image */}
        <div className="relative h-48 w-48 rounded-full bg-gray-200">
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {textLine1 && (
              <p className="text-center text-xl font-bold text-black">{textLine1}</p>
            )}
            {textLine2 && (
              <p className="text-center text-xl font-bold text-black">{textLine2}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Update Product Description Component

**File: `components/product/product-description.tsx`**

Add a "Customize" button to the product description component:

```typescript
import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { VariantSelector } from './variant-selector';
import { useState } from 'react';
import { CustomizeHatModal } from './customize-hat-modal';
import { useProduct } from './product-context';

export function ProductDescription({ product }: { product: Product }) {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const { state } = useProduct();

  // Only show customize button for the "Customizable Hat" product
  const isCustomizableHat = product.title === 'Customizable Hat';

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>
      <VariantSelector options={product.options} variants={product.variants} />
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : null}

      {isCustomizableHat && (
        <div className="mb-6">
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="w-full rounded-full bg-blue-100 p-4 text-blue-900 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            {state.customization?.line1 ? 'Edit Customization' : 'Customize Hat'}
          </button>

          {state.customization?.line1 && (
            <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <h3 className="font-medium">Your Customization:</h3>
              <p>Line 1: {state.customization.line1}</p>
              {state.customization.line2 && <p>Line 2: {state.customization.line2}</p>}
            </div>
          )}

          <CustomizeHatModal
            isOpen={isCustomizeModalOpen}
            closeModal={() => setIsCustomizeModalOpen(false)}
          />
        </div>
      )}

      <AddToCart product={product} />
    </>
  );
}
```

### 2.4 Update Add to Cart Component

**File: `components/cart/add-to-cart.tsx`**

Modify the AddToCart component to include customization data:

```typescript
export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [message, formAction] = useActionState(addItem, null);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;

  // Check if this is the customizable hat product
  const isCustomizableHat = product.title === 'Customizable Hat';

  // Prepare attributes for customization if needed
  const attributes = isCustomizableHat && state.customization?.line1
    ? [
        { key: 'line1_text', value: state.customization.line1 },
        ...(state.customization.line2 ? [{ key: 'line2_text', value: state.customization.line2 }] : [])
      ]
    : undefined;

  // Validate that line1 is provided for customizable hat
  const isCustomizationValid = !isCustomizableHat || (isCustomizableHat && state.customization?.line1);

  const addItemAction = formAction.bind(null, selectedVariantId);
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  )!;

  return (
    <form
      action={async () => {
        // Add attributes to cart item if available
        addCartItem(finalVariant, product, attributes);
        addItemAction();
      }}
    >
      <SubmitButton
        availableForSale={availableForSale && isCustomizationValid}
        selectedVariantId={selectedVariantId}
        isCustomizationRequired={isCustomizableHat && !state.customization?.line1}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}

function SubmitButton({
  availableForSale,
  selectedVariantId,
  isCustomizationRequired
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  isCustomizationRequired?: boolean;
}) {
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white';
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        {isCustomizationRequired ? 'Please Customize Hat First' : 'Out Of Stock'}
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        'hover:opacity-90': true
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}
```

### 2.5 Update Cart Context

**File: `components/cart/cart-context.tsx`**

Update the cart context to handle line item properties:

```typescript
export function useCart() {
  // ... existing code ...

  const addCartItem = async (
    variant: ProductVariant,
    product: Product,
    attributes?: { key: string; value: string }[]
  ) => {
    // ... existing code ...

    // Add the item to the cart
    const newItem = {
      merchandiseId: variant.id,
      quantity: 1,
      attributes,
    };

    // ... rest of the function ...
  };

  // ... rest of the component ...
}
```

## 3. Assets and Resources

### 3.1 Hat Images

Create a directory for hat images:

```
public/images/hats/
```

Add placeholder images for each hat style:

- classic.png
- trucker.png
- etc.

### 3.2 Font Selection

Use web-safe fonts or add custom fonts to the project:

**File: `app/globals.css`**

```css
/* Add custom fonts if needed */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

/* Use in hat preview */
.hat-text {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
}
```

## 4. Testing Plan

### 4.1 Unit Tests

Create tests for text validation and cart operations:

**File: `__tests__/customization.test.ts`**

```typescript
import { validateCustomization } from 'lib/validation';

describe('Customization Validation', () => {
  test('should validate required line1', () => {
    const result = validateCustomization({ line1: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.line1).toBeDefined();
  });

  test('should validate max length', () => {
    const result = validateCustomization({
      line1: 'A'.repeat(21),
    });
    expect(result.valid).toBe(false);
    expect(result.errors.line1).toBeDefined();
  });

  test('should pass valid customization', () => {
    const result = validateCustomization({
      line1: 'Hello',
      line2: 'World',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });
});
```

### 4.2 Integration Tests

Test the end-to-end flow from customization to checkout:

**File: `cypress/e2e/customization.cy.js`**

```javascript
describe('Hat Customization', () => {
  it('should allow customizing a hat and adding to cart', () => {
    cy.visit('/product/customizable-hat');

    // Select variant options
    cy.contains('Color').parent().contains('Blue').click();
    cy.contains('Style').parent().contains('Classic Cap').click();
    cy.contains('Size').parent().contains('M').click();

    // Open customization modal
    cy.contains('Customize Hat').click();

    // Enter customization text
    cy.get('input[maxlength="20"]').first().type('Hello');
    cy.get('input[maxlength="20"]').last().type('World');

    // Save customization
    cy.contains('Save Customization').click();

    // Verify customization summary is shown
    cy.contains('Your Customization:');
    cy.contains('Line 1: Hello');
    cy.contains('Line 2: World');

    // Add to cart
    cy.contains('Add To Cart').click();

    // Verify cart contains item with customization
    cy.contains('Cart').click();
    cy.contains('Customizable Hat');
    cy.contains('Blue, Classic Cap, Size M');
    cy.contains('Hello / World');
  });
});
```

## 5. Deployment Strategy

### 5.1 Phased Rollout

1. Deploy backend changes first:

   - Update types and API integration
   - Add line item properties support

2. Release frontend components with feature flags:

   - Add customization components behind a feature flag
   - Test with a small percentage of users

3. Monitor performance and user feedback:
   - Track customization usage
   - Collect feedback on the customization experience

### 5.2 Documentation

1. Update internal documentation for the fulfillment team:

   - How to view and process customization details
   - Guidelines for text placement on different hat styles

2. Create user guide for the customization feature:
   - How to use the customization interface
   - Character limits and restrictions
   - Preview limitations

## 6. Timeline and Resources

### 6.1 Estimated Timeline

1. Backend Implementation: 1 week
2. Frontend Components: 2 weeks
3. Testing and QA: 1 week
4. Documentation and Deployment: 1 week

Total: 5 weeks

### 6.2 Required Resources

1. Frontend Developer: 1 full-time
2. Backend Developer: 1 part-time
3. QA Engineer: 1 part-time
4. Designer: 1 part-time (for hat images and UI design)

## 7. Risks and Mitigations

### 7.1 Risks

1. Shopify API limitations for line item properties
2. Performance issues with real-time preview rendering
3. Mobile responsiveness challenges with the customization interface

### 7.2 Mitigations

1. Test Shopify API integration thoroughly before implementation
2. Optimize preview rendering with efficient techniques
3. Design mobile-first and test on various devices
