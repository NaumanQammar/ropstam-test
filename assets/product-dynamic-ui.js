// JS for dynamic width, drop, panels, and price logic
(function() {
  // Utility: Safely get nested property
  function get(obj, path, def) {
    return path.reduce((xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined), obj) ?? def;
  }

  // DOM selectors
  const widthSelector = document.getElementById('WidthSelector');
  const dropSelector = document.getElementById('DropSelector');
  const priceDisplay = document.querySelector('[data-testid="sticky-price-display"], .product__price, #ProductPrice');
  const addToCartBtn = document.querySelector('.add-to-cart-button, [data-add-to-cart], #AddToCart');
  const variantInput = document.querySelector('input[name="id"]');

  // Assume window.productVariants is available as JSON
  const variants = window.productVariants || [];

  function updatePricingAndVariant() {
    const pricingData = window.pricingData;
    const width = widthSelector && widthSelector.value;
    const drop = dropSelector && dropSelector.value;
    if (!pricingData || !width || !drop || !pricingData[width]) {
      setPrice(null);
      setPanels(null);
      setVariant(null);
      return;
    }
    const panels = pricingData[width].panels;
    const price = get(pricingData, [width, 'prices', drop], null);
    setPanels(panels);
    setPrice(price);
    setVariant(drop, panels);
  }

  function setPanels(panels) {
    window.calculatedPanels = panels;
  }

  function setPrice(price) {
    if (priceDisplay) {
      priceDisplay.textContent = price !== null ? `£${price}` : '—';
    }
    if (addToCartBtn) {
      addToCartBtn.textContent = price !== null ? `£${price} - Add to cart` : 'Add to cart';
    }
  }

  function setVariant(drop, panels) {
    if (!drop || !panels || !variants.length) return;
    const variant = variants.find(function(v) {
      return v.option1 == drop && v.option2 == String(panels);
    });
    if (variant && variantInput) {
      variantInput.value = variant.id;
      addToCartBtn.disabled = !variant.available;
    }
  }

  if (widthSelector) widthSelector.addEventListener('change', updatePricingAndVariant);
  if (dropSelector) dropSelector.addEventListener('change', updatePricingAndVariant);
  updatePricingAndVariant();
})();
