'use client';

import { useState } from 'react';
import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/price';
import Prose from 'components/prose';
import { Product } from 'lib/shopify/types';
import { VariantSelector } from './variant-selector';
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
            {state.customization?.line1
              ? 'Edit Customization'
              : 'Customize Hat'}
          </button>

          {state.customization?.line1 && (
            <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <h3 className="font-medium">Your Customization:</h3>
              <p>Line 1: {state.customization.line1}</p>
              {state.customization.line2 && (
                <p>Line 2: {state.customization.line2}</p>
              )}
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
