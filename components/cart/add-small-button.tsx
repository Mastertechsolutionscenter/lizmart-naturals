'use client';

import { Product, ProductVariant } from '@/lib/neondb/types';
import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

import { startTransition, useState } from 'react';
import { addItem } from './actions';
import { useCart } from './cart-context';

export function AddSmallButton({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const [isPending, setIsPending] = useState(false); 

  
  const defaultVariant: ProductVariant = product.variants?.[0] ?? {
    id: product.id,
    title: product.title,
    availableForSale: product.availableForSale,
    selectedOptions: [],
    price: product.priceRange?.minVariantPrice ?? {
      amount: '0',
      currencyCode: 'KES'
    }
  };

  const disabled = !defaultVariant.availableForSale || isPending;

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    const selectedVariantId = defaultVariant.id;
    if (!selectedVariantId) {
        console.error("Cannot add to cart: Default variant ID is missing.");
        return;
    }

    setIsPending(true);

    
    startTransition(() => {
      addCartItem(defaultVariant, product);
    });

    
    try {
      
      await addItem(null, selectedVariantId);
      
    } catch (error) {
      console.error('Failed to add item to cart.', error);      
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={onAdd}
      disabled={disabled}
      className={clsx(
        'w-full inline-flex items-center justify-center rounded-full bg-[#FBC02D] px-4 py-2 text-xs font-medium text-white hover:bg-gray-900 transition',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isPending ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding...
        </span>
      ) : (
        <>
          <PlusIcon className="h-4 w-4 mr-1" />
          Buy Now
        </>
      )}
    </button>
  );
}