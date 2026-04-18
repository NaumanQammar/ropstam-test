// Modular JS for dynamic pricing on Shopify PDP (Horizon theme)
(function() {
  // Utility: Safely get nested property
  function get(obj, path, def) {
    return path.reduce((xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined), obj) ?? def;
  }

  // DOM selectors (update if your theme uses different IDs/classes)
  const widthSelector = document.querySelector('[name="width"], #Width, .product-width');
  const dropSelector = document.querySelector('[name="drop"], #Drop, .product-drop');
  const priceDisplay = document.querySelector('[data-testid="sticky-price-display"], .product__price, #ProductPrice');
  const addToCartBtn = document.querySelector('.add-to-cart-button, [data-add-to-cart], #AddToCart');

  if (!widthSelector || !dropSelector || !priceDisplay || !addToCartBtn) {
    // Required elements not found, abort
    return;
  }

  function updatePricing() {
    const pricingData = window.pricingData;
    if (!pricingData || typeof pricingData !== 'object') {
      setPrice(null);
      setPanels(null);
      return;
    }

    const width = widthSelector.value;
    const drop = dropSelector.value;
    if (!width || !pricingData[width]) {
      setPrice(null);
      setPanels(null);
      return;
    }

    const panels = pricingData[width].panels;
    const price = get(pricingData, [width, 'prices', drop], null);

    setPanels(panels);
    setPrice(price);
  }

  function setPanels(panels) {
    // Optionally update panels display if you have one
    // Example: document.querySelector('#Panels').textContent = panels ?? '-';
  }

  function setPrice(price) {
    if (priceDisplay) {
      priceDisplay.textContent = price !== null ? `£${price}` : '—';
    }
    if (addToCartBtn) {
      addToCartBtn.textContent = price !== null ? `£${price} - Add to cart` : 'Add to cart';
    }
  }

  widthSelector.addEventListener('change', updatePricing);
  dropSelector.addEventListener('change', updatePricing);

  // Initial run
  updatePricing();
})();
