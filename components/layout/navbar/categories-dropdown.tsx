// components/CategoriesDropdown.tsx
"use client";

import React, { useState } from "react";
import { Menu, ChevronDown, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Collection } from "@/lib/neondb/types";

export type CategoriesDropdownProps = {
  collections: Collection[];      // your collection objects (must have .handle and .title)
  isMobile?: boolean;            // if true, render mobile collapsible style
  openKey?: string | null;       // controlled open key (for desktop usage)
  onOpen?: (key: string) => void;
  onClose?: () => void;
  // optional: className for outer wrapper
  className?: string;
};

/**
 * CategoriesDropdown
 * - Desktop: controlled by openKey and onOpen/onClose (hover behavior)
 * - Mobile: internal toggle (click to expand)
 */
export default function CategoriesDropdown({
  collections,
  isMobile = false,
  openKey,
  onOpen,
  onClose,
  className = "",
}: CategoriesDropdownProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false); // mobile toggle

  const handleNavigate = (handle: string) => {
    // Navigate to /search/{handle}
    router.push(`/search/${handle}`);
  };

  const LinksContent = (
    <ul className="py-3">
      {collections.map((collection) => (
        <li key={collection.handle}>
          <a
            href={`/search/${collection.handle}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigate(collection.handle);
            }}
            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition duration-150 ${
              isMobile ? "mx-0" : "rounded-md mx-2 my-1"
            }`}
          >
            <ShoppingBag className="w-4 h-4 mr-3 text-teal-600 flex-shrink-0" />
            <span className="truncate">{collection.title}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  // Mobile view: collapsible section that only shows content when toggled
  if (isMobile) {
    return (
      <div className={`mt-4 border-t ${className}`}>
        <button
          onClick={() => setExpanded((s) => !s)}
          aria-expanded={expanded}
          className="w-full flex items-center justify-between px-4 py-2 font-semibold text-gray-700 bg-gray-50"
        >
          <div className="flex items-center">
            <Menu className="w-5 h-5 mr-2" />
            <span className="uppercase text-xs tracking-wide">Categories</span>
          </div>

          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <div className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-[1000px]" : "max-h-0"}`}>
          {LinksContent}
        </div>
      </div>
    );
  }

  // Desktop view: parent controls opening by passing openKey === 'categories'
  const isOpen = openKey === "categories";

  return (
    <div
      className={`relative h-full ${className}`}
      onMouseEnter={() => onOpen?.("categories")}
      onMouseLeave={() => onClose?.()}
    >
      <button
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center justify-between h-full px-4 py-2 text-white bg-teal-600 font-semibold text-sm tracking-wide rounded-md shadow-md focus:outline-none"
      >
        <div className="flex items-center">
          <Menu className="w-4 h-4 mr-2" />
          <span className="uppercase">Categories</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`absolute left-0 mt-2 z-40 w-80 bg-white border border-gray-200 shadow-lg rounded-md p-2 transform transition-all duration-200 origin-top-left ${
          isOpen ? "opacity-100 visible translate-y-0 pointer-events-auto" : "opacity-0 invisible -translate-y-1 pointer-events-none"
        }`}
      >
        {/* invisible bridge to prevent hover-gap flicker */}
        <div className="absolute -top-2 left-0 right-0 h-2" />
        <div className="grid grid-cols-1 gap-1 max-h-72 overflow-auto">{LinksContent}</div>
      </div>
    </div>
  );
}
