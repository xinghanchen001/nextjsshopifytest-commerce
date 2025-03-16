'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  createContext,
  useContext,
  useMemo,
  useOptimistic,
} from 'react';
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

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const getInitialState = () => {
    const params: ProductState = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    // Try to get customization from URL params
    if (params.line1) {
      params.customization = {
        line1: params.line1,
        ...(params.line2 ? { line2: params.line2 } : {}),
      };
    }

    return params;
  };

  const [state, setOptimisticState] = useOptimistic(
    getInitialState(),
    (prevState: ProductState, update: ProductState) => ({
      ...prevState,
      ...update,
    })
  );

  const updateOption = (name: string, value: string) => {
    const newState = { [name]: value };
    setOptimisticState(newState);
    return { ...state, ...newState };
  };

  const updateImage = (index: string) => {
    const newState = { image: index };
    setOptimisticState(newState);
    return { ...state, ...newState };
  };

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
      updateCustomization,
    }),
    [state]
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}

export function useUpdateURL() {
  const router = useRouter();

  return (state: ProductState) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(state).forEach(([key, value]) => {
      if (key !== 'customization') {
        newParams.set(key, value);
      }
    });

    // Add customization params to URL
    if (state.customization) {
      newParams.set('line1', state.customization.line1);
      if (state.customization.line2) {
        newParams.set('line2', state.customization.line2);
      } else {
        newParams.delete('line2');
      }
    }

    router.push(`?${newParams.toString()}`, { scroll: false });
  };
}
