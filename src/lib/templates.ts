import type { UnitOfMeasure } from '@/types'

// Starter templates so MyShopFlow fits any physical-goods business on day one —
// retail, wholesale, and everything in between. Each seeds a relevant set of
// categories and products (with units + wholesale pricing where it makes sense).

export interface TemplateProduct {
  name: string
  category: string
  cost: number
  retail: number
  wholesale?: number
  wholesaleMin?: number
  unit?: UnitOfMeasure
  pack?: number
  stock: number
  threshold: number
}

export interface BusinessTemplate {
  id: string
  name: string
  description: string
  icon: string // lucide name
  profileType: string
  categories: { name: string; icon: string }[]
  products: TemplateProduct[]
}

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'general-retail',
    name: 'General Retail',
    description: 'Variety shop selling a bit of everything.',
    icon: 'Store',
    profileType: 'Retail Shop',
    categories: [
      { name: 'Beverages', icon: 'CupSoda' },
      { name: 'Provisions', icon: 'ShoppingBasket' },
      { name: 'Household', icon: 'Home' },
      { name: 'Accessories', icon: 'Smartphone' },
    ],
    products: [
      { name: 'Bottled Water 500ml', category: 'Beverages', cost: 1.2, retail: 2.5, wholesale: 2, wholesaleMin: 24, pack: 24, stock: 200, threshold: 40 },
      { name: 'Soft Drink 350ml', category: 'Beverages', cost: 3.5, retail: 6, wholesale: 5, wholesaleMin: 24, pack: 24, stock: 120, threshold: 24 },
      { name: 'Instant Noodles', category: 'Provisions', cost: 2, retail: 3.5, wholesale: 3, wholesaleMin: 40, pack: 40, stock: 240, threshold: 48 },
      { name: 'Cooking Oil 1L', category: 'Provisions', cost: 18, retail: 26, wholesale: 23, wholesaleMin: 12, unit: 'litre', stock: 60, threshold: 12 },
      { name: 'Detergent 1kg', category: 'Household', cost: 14, retail: 24, wholesale: 20, wholesaleMin: 12, unit: 'kg', stock: 55, threshold: 15 },
      { name: 'Phone Charging Cable', category: 'Accessories', cost: 8, retail: 20, wholesale: 15, wholesaleMin: 20, stock: 60, threshold: 15 },
    ],
  },
  {
    id: 'minimart-grocery',
    name: 'Minimart & Grocery',
    description: 'Everyday groceries and fresh essentials.',
    icon: 'ShoppingCart',
    profileType: 'Grocery Store',
    categories: [
      { name: 'Groceries', icon: 'ShoppingBasket' },
      { name: 'Beverages', icon: 'CupSoda' },
      { name: 'Frozen & Dairy', icon: 'Snowflake' },
      { name: 'Household', icon: 'Home' },
    ],
    products: [
      { name: 'Rice 5kg', category: 'Groceries', cost: 45, retail: 62, wholesale: 56, wholesaleMin: 5, stock: 40, threshold: 10 },
      { name: 'Sugar 1kg', category: 'Groceries', cost: 9, retail: 14, wholesale: 12, wholesaleMin: 10, unit: 'kg', stock: 80, threshold: 15 },
      { name: 'Fresh Milk 1L', category: 'Frozen & Dairy', cost: 8, retail: 13, unit: 'litre', stock: 40, threshold: 12 },
      { name: 'Frozen Chicken 1kg', category: 'Frozen & Dairy', cost: 22, retail: 34, wholesale: 30, wholesaleMin: 10, unit: 'kg', stock: 30, threshold: 8 },
      { name: 'Fruit Juice 1L', category: 'Beverages', cost: 7, retail: 12, wholesale: 10, wholesaleMin: 12, unit: 'litre', stock: 70, threshold: 12 },
      { name: 'Tissue Roll 10pk', category: 'Household', cost: 18, retail: 30, wholesale: 26, wholesaleMin: 12, unit: 'pack', stock: 48, threshold: 12 },
    ],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'Medicines, personal care and first aid.',
    icon: 'Cross',
    profileType: 'Pharmacy',
    categories: [
      { name: 'Medicines', icon: 'Pill' },
      { name: 'Personal Care', icon: 'Sparkles' },
      { name: 'Baby Care', icon: 'Baby' },
      { name: 'First Aid', icon: 'BriefcaseMedical' },
    ],
    products: [
      { name: 'Paracetamol 500mg', category: 'Medicines', cost: 3, retail: 6, wholesale: 5, wholesaleMin: 20, unit: 'pack', stock: 150, threshold: 30 },
      { name: 'Antacid Tablets', category: 'Medicines', cost: 4, retail: 8, wholesale: 6.5, wholesaleMin: 12, unit: 'pack', stock: 90, threshold: 20 },
      { name: 'Hand Sanitiser 250ml', category: 'Personal Care', cost: 6, retail: 12, wholesale: 10, wholesaleMin: 12, unit: 'ml', stock: 70, threshold: 15 },
      { name: 'Baby Diapers M (pack)', category: 'Baby Care', cost: 35, retail: 55, wholesale: 48, wholesaleMin: 6, unit: 'pack', stock: 40, threshold: 8 },
      { name: 'Sterile Gauze', category: 'First Aid', cost: 2, retail: 5, unit: 'pack', stock: 120, threshold: 20 },
      { name: 'Digital Thermometer', category: 'First Aid', cost: 25, retail: 45, stock: 20, threshold: 5 },
    ],
  },
  {
    id: 'electronics',
    name: 'Electronics & Phones',
    description: 'Phones, gadgets and accessories.',
    icon: 'Smartphone',
    profileType: 'Electronics',
    categories: [
      { name: 'Phones', icon: 'Smartphone' },
      { name: 'Accessories', icon: 'Cable' },
      { name: 'Audio', icon: 'Headphones' },
      { name: 'Computing', icon: 'Laptop' },
    ],
    products: [
      { name: 'Smartphone (entry)', category: 'Phones', cost: 620, retail: 850, wholesale: 790, wholesaleMin: 3, stock: 18, threshold: 4 },
      { name: 'USB-C Cable', category: 'Accessories', cost: 8, retail: 20, wholesale: 15, wholesaleMin: 20, stock: 80, threshold: 15 },
      { name: 'Power Bank 10000mAh', category: 'Accessories', cost: 60, retail: 130, wholesale: 110, wholesaleMin: 5, stock: 24, threshold: 6 },
      { name: 'Wireless Earbuds', category: 'Audio', cost: 70, retail: 150, wholesale: 130, wholesaleMin: 4, unit: 'pair', stock: 22, threshold: 5 },
      { name: 'Bluetooth Speaker', category: 'Audio', cost: 90, retail: 180, wholesale: 155, wholesaleMin: 3, stock: 16, threshold: 4 },
      { name: 'Wireless Mouse', category: 'Computing', cost: 22, retail: 45, wholesale: 38, wholesaleMin: 10, stock: 40, threshold: 10 },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Boutique',
    description: 'Clothing, footwear and accessories.',
    icon: 'Shirt',
    profileType: 'Boutique',
    categories: [
      { name: 'Clothing', icon: 'Shirt' },
      { name: 'Footwear', icon: 'Footprints' },
      { name: 'Bags', icon: 'ShoppingBag' },
      { name: 'Accessories', icon: 'Watch' },
    ],
    products: [
      { name: 'Cotton T-Shirt', category: 'Clothing', cost: 25, retail: 55, wholesale: 45, wholesaleMin: 10, stock: 60, threshold: 12 },
      { name: 'Denim Jeans', category: 'Clothing', cost: 60, retail: 120, wholesale: 100, wholesaleMin: 6, stock: 40, threshold: 8 },
      { name: 'Ladies Sandals', category: 'Footwear', cost: 40, retail: 85, wholesale: 72, wholesaleMin: 6, unit: 'pair', stock: 30, threshold: 8 },
      { name: 'Sneakers', category: 'Footwear', cost: 90, retail: 180, wholesale: 155, wholesaleMin: 4, unit: 'pair', stock: 24, threshold: 6 },
      { name: 'Handbag', category: 'Bags', cost: 55, retail: 130, stock: 20, threshold: 5 },
      { name: 'Wrist Watch', category: 'Accessories', cost: 35, retail: 90, wholesale: 75, wholesaleMin: 6, stock: 28, threshold: 6 },
    ],
  },
  {
    id: 'wholesale',
    name: 'Wholesale Distributor',
    description: 'Move stock in bulk to other businesses.',
    icon: 'Truck',
    profileType: 'Wholesale',
    categories: [
      { name: 'Beverages', icon: 'CupSoda' },
      { name: 'Provisions', icon: 'ShoppingBasket' },
      { name: 'Household', icon: 'Home' },
    ],
    products: [
      { name: 'Soft Drink (carton)', category: 'Beverages', cost: 84, retail: 120, wholesale: 108, wholesaleMin: 10, unit: 'carton', stock: 300, threshold: 40 },
      { name: 'Bottled Water (carton)', category: 'Beverages', cost: 29, retail: 48, wholesale: 42, wholesaleMin: 20, unit: 'carton', stock: 400, threshold: 60 },
      { name: 'Rice (50kg bag)', category: 'Provisions', cost: 380, retail: 460, wholesale: 430, wholesaleMin: 10, unit: 'kg', stock: 120, threshold: 20 },
      { name: 'Cooking Oil (25L)', category: 'Provisions', cost: 340, retail: 420, wholesale: 395, wholesaleMin: 8, unit: 'litre', stock: 90, threshold: 15 },
      { name: 'Detergent (carton)', category: 'Household', cost: 160, retail: 220, wholesale: 200, wholesaleMin: 6, unit: 'carton', stock: 100, threshold: 20 },
      { name: 'Tissue (bulk box)', category: 'Household', cost: 120, retail: 175, wholesale: 158, wholesaleMin: 6, unit: 'box', stock: 80, threshold: 15 },
    ],
  },
]

export function getTemplate(id: string): BusinessTemplate | undefined {
  return BUSINESS_TEMPLATES.find((t) => t.id === id)
}
