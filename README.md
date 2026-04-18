# Demo Link
https://pfjng2-2y.myshopify.com/products/fabric-curtain

# Preview Password
meyeod

# Shopify Horizon PDP Dynamic Pricing Setup

This repository contains a custom Product Detail Page (PDP) implementation for Shopify Horizon theme with dynamic pricing logic based on:

- Width (metafield)
- Drop (variant option shown to customer)
- Panels (variant option hidden from customer, calculated from Width)

## What This Implementation Does

- Shows product media on the left and product controls on the right.
- Shows Width and Drop selectors on PDP.
- Hides Panels from UI but uses it in variant resolution.
- Uses metafield pricing table to calculate final display price.
- Updates Add to Cart button text in real time (no page reload).
- Sends calculated values to cart as line item properties.
- Displays calculated pricing in cart line rows and cart totals.

## Shopify Admin Setup

## 1) Product Variants
Create two variant options on each product:

1. Drop (visible)
2. Panels (hidden in frontend)

Example option values:

- Drop: 100, 120
- Panels: 2, 3

Create all combinations you intend to sell:

- Drop 100 + Panels 2
- Drop 100 + Panels 3
- Drop 120 + Panels 2
- Drop 120 + Panels 3

## 2) Product Metafields
Create these product metafields under namespace custom:

1. pricing (type: JSON)
2. widths (type: Single line text)
3. fabrics (type: JSON)
4. colours (type: JSON)

Example values:

pricing:

{
  "100": {
    "panels": 2,
    "prices": {
      "100": 120,
      "120": 140
    }
  },
  "150": {
    "panels": 3,
    "prices": {
      "100": 180,
      "120": 210
    }
  }
}

widths:

100,120,150

fabrics:

["Cotton", "Linen", "Velvet"]

colours:

["White", "Stone", "Grey"]

Important:

- Every width listed in custom.widths should exist in custom.pricing keys.
- Drop values in pricing.prices should match variant Drop values.

## Pricing Logic Flow

1. Customer selects Width.
2. Script finds matching pricing key from custom.pricing.
3. Script reads required panels from pricing[width].panels.
4. Script populates Drop values from pricing[width].prices keys.
5. Customer selects Drop.
6. Script gets final price from pricing[width].prices[drop].
7. Script finds variant by:
   - option1 = Drop
   - option2 = Panels (calculated)
8. Script updates:
   - hidden variant input (name=id)
   - Add to Cart button text
   - hidden line item properties for cart display

## Theme Files Updated

- sections/product-information.liquid
  - custom two-column PDP layout
  - modal trigger and containers
  - width/drop controls
  - hidden properties for calculated pricing

- assets/product-dynamic-ui.js
  - width/drop/panels pricing logic
  - variant resolution
  - quantity plus/minus handling
  - modal swatch rendering from JSON metafields

- snippets/expose-pricing-data.liquid
  - exposes pricing, variants, widths, fabrics, colours as global JS data

- snippets/cart-products.liquid
  - displays custom calculated line prices when present

- snippets/cart-summary.liquid
  - displays custom calculated subtotal/total when present


## Recommended GitHub Notes

When sharing this project, include:

- Product variant model (Drop + Panels)
- Metafield schema and sample data
- Pricing flow diagram (Width -> Panels -> Drop -> Price -> Variant)
- Cart vs Checkout limitation and backend options
