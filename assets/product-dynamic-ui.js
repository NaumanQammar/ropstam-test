// @ts-nocheck
// JS for dynamic width, drop, panels, and price logic
(function() {
  // Utility: Safely get nested property
  function get(obj, path, def) {
    return path.reduce((xs, x) => (xs && xs[x] !== undefined ? xs[x] : undefined), obj) ?? def;
  }

  function normalizeValue(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase().replace(/cm/g, '').trim();
  }

  function findPricingKeyByWidth(width, pricingData) {
    if (!pricingData || typeof pricingData !== 'object') return null;

    if (pricingData[width]) return width;

    const normalizedWidth = normalizeValue(width);
    return Object.keys(pricingData).find(function(key) {
      return normalizeValue(key) === normalizedWidth;
    }) || null;
  }

  // DOM selectors
  const widthSelector = /** @type {HTMLSelectElement | null} */ (document.getElementById('WidthSelector'));
  const dropSelector = /** @type {HTMLSelectElement | null} */ (document.getElementById('DropSelector'));
  const priceDisplay = document.querySelector('[data-testid="sticky-price-display"], .product__price, #ProductPrice');
  const addToCartBtn = /** @type {HTMLButtonElement | null} */ (document.querySelector('.add-to-cart-button, [data-add-to-cart], #AddToCart'));
  const variantInput = /** @type {HTMLInputElement | null} */ (document.querySelector('input[name="id"]'));

  const fabricSwatches = document.getElementById('fabric-swatches');
  const colourSwatches = document.getElementById('colour-swatches');
  const form = document.getElementById('ProductForm');
  const quantityInput = /** @type {HTMLInputElement | null} */ (document.querySelector('#ProductForm .quantity-input'));
  const quantityDecrementBtn = /** @type {HTMLButtonElement | null} */ (document.querySelector('#ProductForm .quantity-decrement'));
  const quantityIncrementBtn = /** @type {HTMLButtonElement | null} */ (document.querySelector('#ProductForm .quantity-increment'));
  const calculatedPriceInput = /** @type {HTMLInputElement | null} */ (document.getElementById('CalculatedPriceInput'));
  const selectedWidthInput = /** @type {HTMLInputElement | null} */ (document.getElementById('SelectedWidthInput'));
  const selectedDropInput = /** @type {HTMLInputElement | null} */ (document.getElementById('SelectedDropInput'));
  const calculatedPanelsInput = /** @type {HTMLInputElement | null} */ (document.getElementById('CalculatedPanelsInput'));

  // Assume window.productVariants is available as JSON
  const variants = window.productVariants || [];

  function normalizeSwatchOptions(raw) {
    if (!raw) return [];
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch (error) {
        return raw.split(',').map(function(item) { return item.trim(); }).filter(Boolean);
      }
    }

    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }

  function optionLabel(option) {
    if (typeof option === 'string' || typeof option === 'number') return String(option);
    if (option && typeof option === 'object') {
      return String(option.name || option.label || option.title || option.value || '');
    }
    return '';
  }

  function renderSwatches(container, options, inputName) {
    if (!container) return;
    const normalized = normalizeSwatchOptions(options);
    container.innerHTML = '';

    normalized.forEach(function(option, index) {
      const label = optionLabel(option);
      if (!label) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.dataset.value = label;
      btn.textContent = label;

      btn.addEventListener('click', function() {
        container.querySelectorAll('.swatch').forEach(function(node) {
          node.classList.remove('selected');
        });
        btn.classList.add('selected');

        var hidden = form ? form.querySelector('input[name="' + inputName + '"]') : null;
        if (!hidden && form) {
          hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = inputName;
          form.appendChild(hidden);
        }
        if (hidden) {
          hidden.value = label;
        }
      });

      if (index === 0) {
        btn.classList.add('selected');
      }

      container.appendChild(btn);
    });

    if (normalized.length && form) {
      var hidden = form.querySelector('input[name="' + inputName + '"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = inputName;
        form.appendChild(hidden);
      }
      if (hidden && !hidden.value) {
        hidden.value = optionLabel(normalized[0]);
      }
    }
  }

  // Helper: Get all valid Drop values for a given width.
  function getDropOptionsForWidth(width) {
    const pricingData = window.pricingData;
    const pricingKey = findPricingKeyByWidth(width, pricingData);
    if (pricingKey && pricingData[pricingKey] && pricingData[pricingKey].prices) {
      return Object.keys(pricingData[pricingKey].prices);
    }

    // Fallback so dropdown is never empty: use unique variant option1 values.
    const variantDrops = variants.map(function(v) { return v.option1; }).filter(Boolean);
    return Array.from(new Set(variantDrops));
  }

  function populateDropOptions(width) {
    if (!dropSelector) return;
    const previousValue = dropSelector.value;
    dropSelector.innerHTML = '';
    const drops = getDropOptionsForWidth(width);

    if (!drops.length) {
      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'No drop available';
      dropSelector.appendChild(placeholder);
      return;
    }

    drops.forEach(function(drop) {
      var opt = document.createElement('option');
      opt.value = drop;
      opt.textContent = drop;
      dropSelector.appendChild(opt);
    });

    const stillExists = drops.some(function(drop) { return String(drop) === String(previousValue); });
    if (stillExists) {
      dropSelector.value = previousValue;
    }
  }

  function updatePricingAndVariant() {
    const pricingData = window.pricingData;
    const width = widthSelector && widthSelector.value;
    const drop = dropSelector && dropSelector.value;
    const pricingKey = findPricingKeyByWidth(width, pricingData);

    if (!pricingData || !width || !drop || !pricingKey || !pricingData[pricingKey]) {
      setPrice(null);
      setPanels(null);
      setVariant(null);
      return;
    }
    const panels = pricingData[pricingKey].panels;
    const price = get(pricingData, [pricingKey, 'prices', drop], null);

    if (selectedWidthInput) selectedWidthInput.value = width || '';
    if (selectedDropInput) selectedDropInput.value = drop || '';

    setPanels(panels);
    setPrice(price);
    setVariant(drop, panels);
  }

  function setPanels(panels) {
    window.calculatedPanels = panels;
    if (calculatedPanelsInput) {
      calculatedPanelsInput.value = panels != null ? String(panels) : '';
    }
  }

  function setPrice(price) {
    if (priceDisplay) {
      priceDisplay.textContent = price !== null ? `£${price}` : '—';
    }
    if (addToCartBtn) {
      addToCartBtn.textContent = price !== null ? `£${price} - Add to cart` : 'Add to cart';
    }
    if (calculatedPriceInput) {
      calculatedPriceInput.value = price !== null ? String(price) : '';
    }
  }

  function setVariant(drop, panels) {
    if (!drop || !panels || !variants.length) return;
    const variant = variants.find(function(v) {
      return v.option1 == drop && v.option2 == String(panels);
    });
    if (variant && variantInput) {
      variantInput.value = variant.id;
      if (addToCartBtn) addToCartBtn.disabled = !variant.available;
    } else if (addToCartBtn) {
      addToCartBtn.disabled = true;
    }
  }

  function getQuantityMin() {
    if (!quantityInput) return 1;
    const parsedMin = parseInt(quantityInput.min || '1', 10);
    return Number.isFinite(parsedMin) && parsedMin > 0 ? parsedMin : 1;
  }

  function updateQuantity(delta) {
    if (!quantityInput) return;
    const min = getQuantityMin();
    const current = parseInt(quantityInput.value || String(min), 10);
    const safeCurrent = Number.isFinite(current) ? current : min;
    const next = Math.max(min, safeCurrent + delta);
    quantityInput.value = String(next);

    // Keep compatibility with listeners expecting native form field changes.
    quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  var activeSelectControl = null;

  function clearActiveSelectControl() {
    if (activeSelectControl) {
      activeSelectControl.classList.remove('is-open');
      activeSelectControl = null;
    }
  }

  function setupSelectOpenState(selectElement) {
    if (!selectElement) return;
    const control = selectElement.closest('.pdp-field-row__control');
    if (!control) return;

    const openControl = function() {
      if (activeSelectControl && activeSelectControl !== control) {
        activeSelectControl.classList.remove('is-open');
      }
      control.classList.add('is-open');
      activeSelectControl = control;
    };

    const closeControl = function() {
      control.classList.remove('is-open');
      if (activeSelectControl === control) {
        activeSelectControl = null;
      }
    };

    selectElement.addEventListener('focus', openControl);
    selectElement.addEventListener('mousedown', openControl);
    selectElement.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        openControl();
      }
      if (event.key === 'Escape') {
        closeControl();
      }
    });

    selectElement.addEventListener('blur', closeControl);
    selectElement.addEventListener('change', closeControl);
  }

  if (widthSelector) {
    widthSelector.addEventListener('change', function() {
      populateDropOptions(widthSelector.value);
      updatePricingAndVariant();
    });
    // Initial population
    populateDropOptions(widthSelector.value);
  }
  if (dropSelector) dropSelector.addEventListener('change', updatePricingAndVariant);

  setupSelectOpenState(widthSelector);
  setupSelectOpenState(dropSelector);

  document.addEventListener('click', function(event) {
    if (!activeSelectControl) return;
    if (!activeSelectControl.contains(event.target)) {
      clearActiveSelectControl();
    }
  });

  window.addEventListener('blur', clearActiveSelectControl);
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      clearActiveSelectControl();
    }
  });

  if (quantityDecrementBtn) {
    quantityDecrementBtn.addEventListener('click', function() {
      updateQuantity(-1);
    });
  }

  if (quantityIncrementBtn) {
    quantityIncrementBtn.addEventListener('click', function() {
      updateQuantity(1);
    });
  }

  if (quantityInput) {
    quantityInput.addEventListener('change', function() {
      const min = getQuantityMin();
      const raw = parseInt(quantityInput.value || String(min), 10);
      quantityInput.value = String(Number.isFinite(raw) && raw >= min ? raw : min);
    });
  }

  renderSwatches(fabricSwatches, window.fabricOptions, 'properties[Fabric]');
  renderSwatches(colourSwatches, window.colourOptions, 'properties[Colour]');

  updatePricingAndVariant();
})();
