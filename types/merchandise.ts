// types.ts (or at top of your component file)
export interface MerchandiseSnapshot {
  product?: { id?: string; title?: string };
  variant?: { id?: string; title?: string; sku?: string };
  selectedOptions?: Record<string, any> | Array<any>;
}
