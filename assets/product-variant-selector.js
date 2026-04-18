// JS for selecting correct Shopify variant based on Drop and Fabric Panels
(function() {
  // Utility: Find variant by options
  function findVariant(variants, drop, panels) {
    return variants.find(function(variant) {
      // Option1 = Drop, Option2 = Fabric Panels
      return variant.option1 == drop && variant.option2 == String(panels);
    });
  }

  // DOM selectors (update if your theme uses different IDs/classes)
  const dropSelector = document.querySelector('[name="drop"], #Drop, .product-drop');
  const variantInput = document.querySelector('input[name="id"]');
  const addToCartBtn = document.querySelector('.add-to-cart-button, [data-add-to-cart], #AddToCart');

  // Assume window.productVariants is available as JSON
  const variants = window.productVariants || [];

  // You must set window.calculatedPanels elsewhere (e.g., from pricing logic)
  function updateVariant() {
    const drop = dropSelector && dropSelector.value;
    const panels = window.calculatedPanels;
    if (!drop || !panels || !variants.length) return;
    const variant = findVariant(variants, drop, panels);
    if (variant && variantInput) {
      variantInput.value = variant.id;
      // Optionally update Add to Cart button state/text
      if (addToCartBtn) {
        addToCartBtn.disabled = !variant.available;
      }
    }
  }

  if (dropSelector) {
    dropSelector.addEventListener('change', updateVariant);
  }

  // If panels can change dynamically, listen for a custom event
  document.addEventListener('panels:updated', updateVariant);

  // Initial run
  updateVariant();

  // Expose for manual triggering if needed
  window.updateShopifyVariant = updateVariant;
})();
