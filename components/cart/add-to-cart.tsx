'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
import { useProduct } from 'components/product/product-context';
import { Product, ProductVariant } from 'lib/shopify/types';
import { textCustomizationToAttributes } from 'lib/types/customization';
import { useActionState } from 'react';
import { useCart } from './cart-context';

function SubmitButton({
  availableForSale,
  selectedVariantId,
  isCustomizationRequired,
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
        {isCustomizationRequired
          ? 'Please Customize Hat First'
          : 'Out Of Stock'}
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
        'hover:opacity-90': true,
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

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
  const attributes =
    isCustomizableHat && state.customization?.line1
      ? textCustomizationToAttributes(state.customization)
      : undefined;

  // Validate that line1 is provided for customizable hat
  const isCustomizationValid =
    !isCustomizableHat || (isCustomizableHat && state.customization?.line1);

  const addItemAction = formAction.bind(null, selectedVariantId);
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  )!;

  return (
    <form
      action={async () => {
        // Don't proceed if customization is required but not provided
        if (isCustomizableHat && !isCustomizationValid) {
          return;
        }
        
        // Add attributes to cart item if available
        addCartItem(finalVariant, product, attributes);
        addItemAction();
      }}
    >
      <SubmitButton
        availableForSale={availableForSale && isCustomizationValid}
        selectedVariantId={selectedVariantId}
        isCustomizationRequired={
          isCustomizableHat && !state.customization?.line1
        }
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
