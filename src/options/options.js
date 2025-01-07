function createBanner(text = 'Label', bgColor = 'gray', textColor = 'white') {
  // Remove any existing banner to avoid duplicates
  const existingBanner = document.querySelector(".oneSystemMessage.banner");
  if (existingBanner) {
    existingBanner.remove();
  }

  // Determine the gradient color based on the background color
  const gradientColor = getContrastColor(bgColor);

  // Create a new banner element
  const banner = document.createElement("div");
  banner.className = "slds-notify_alert slds-notify--alert oneSystemMessage banner";

  // Apply explicit styles to ensure visibility and correct layout
  Object.assign(banner.style, {
    position: "fixed", // Changed to fixed to ensure visibility
    top: "0", // Positioned at the top
    left: "0",
    display: "block", // Makes it span the full width
    width: "100%", // Full-width banner
    padding: "0.5rem 2rem", // Padding for spacing
    color: textColor, // Text color
    fontWeight: "bold", // Bold text
    textAlign: "center", // Center text alignment
    backgroundColor: bgColor, // Background color
    backgroundImage: `linear-gradient(45deg, ${gradientColor} 25%, transparent 25%, transparent 50%, ${gradientColor} 50%, ${gradientColor} 75%, transparent 75%, transparent)`,
    backgroundSize: "64px 64px", // Matches Salesforce's style
    zIndex: "10000", // High z-index to ensure it’s above other elements
    boxSizing: "border-box", // Include padding in width calculations
  });

  // Add content to the banner
  banner.textContent = text;

  // Insert the banner into the banner-placeholder element
  const bannerPlaceholder = document.getElementById('banner-placeholder');
  if (bannerPlaceholder) {
    bannerPlaceholder.appendChild(banner);
  } else {
    console.error('Banner placeholder element not found');
  }
}

// Helper function to determine the contrast color
function getContrastColor(bgColor) {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const transparency = 0.1; // Fixed transparency value
  return (yiq >= 128) ? `rgba(0, 0, 0, ${transparency})` : `rgba(255, 255, 255, ${transparency})`;
}

document.addEventListener('DOMContentLoaded', function () {
  const entriesContainer = document.getElementById('entries');
  const addEntryButton = document.getElementById('addEntryButton');
  const bannerPlaceholder = document.getElementById('banner-placeholder');

  const boldColors = [
    'Crimson', 'DodgerBlue', 'DarkOrange', 'ForestGreen', 'Gold', 'HotPink', 'MediumPurple', 'Tomato', 'Turquoise',
    'DeepPink', 'LimeGreen', 'RoyalBlue', 'OrangeRed', 'MediumVioletRed', 'SpringGreen', 'SteelBlue', 'DarkMagenta',
    'DarkTurquoise', 'FireBrick', 'GoldenRod', 'Indigo', 'LightSeaGreen', 'Magenta', 'MediumOrchid', 'MediumSeaGreen',
    'MediumSlateBlue', 'Navy', 'OliveDrab', 'Orange', 'Orchid', 'PaleVioletRed', 'Peru', 'Plum', 'RebeccaPurple',
    'Salmon', 'SandyBrown', 'SeaGreen', 'Sienna', 'SlateBlue', 'SlateGray', 'Teal', 'Thistle', 'Violet', 'YellowGreen',
    'Chartreuse', 'Coral', 'DarkCyan', 'DarkGoldenRod', 'DarkKhaki', 'DarkOliveGreen'
  ]

  // Load entries from storage
  chrome.storage.local.get('entries', (result) => {
    if (result.entries && result.entries.length > 0) {
      result.entries.forEach(entryData => {
        addEntry(entryData);
      });
    } else {
      addEntry(); // Add a blank entry if no entries are found
    }
  });

  if (addEntryButton) {
    addEntryButton.addEventListener('click', () => {
      addEntry();
    });
  }

  function addEntry(entryData = {}) {
    const entry = document.createElement('tr');
    entry.className = 'entry';

    const usedColors = Array.from(document.querySelectorAll('.entry .bg-color-text')).map(input => input.value);
    const availableColors = boldColors.filter(color => !usedColors.includes(color));
    const bgColor = availableColors.length > 0 ? availableColors[0] : 'DodgerBlue';
    const bgColorHex = convertToHex(entryData.bgColor || bgColor);
    const textColor = suggestTextColor(bgColorHex);

    entry.innerHTML = `
      <td><input type="text" placeholder="Subdomain" class="subdomain" value="${entryData.subdomain || ''}"></td>
      <td><input type="text" placeholder="Label" class="label" value="${entryData.label || ''}"></td>
      <td>
        <div class="color-input">
          <input type="text" placeholder="Background Color" class="bg-color-text" value="${entryData.bgColor || bgColor}">
          <input type="color" class="bg-color-picker" value="${bgColorHex}">
        </div>
      </td>
      <td>
        <div class="color-input">
          <input type="text" placeholder="Text Color" class="text-color-text" value="${entryData.textColor || textColor}">
          <input type="color" class="text-color-picker" value="${convertToHex(entryData.textColor || textColor)}">
        </div>
      </td>
      <td><button class="remove-button"><i class="fas fa-trash-alt"></i></button></td>
    `;

    const bgColorText = entry.querySelector('.bg-color-text');
    const bgColorPicker = entry.querySelector('.bg-color-picker');
    const textColorText = entry.querySelector('.text-color-text');
    const textColorPicker = entry.querySelector('.text-color-picker');
    const subdomainInput = entry.querySelector('.subdomain');
    const labelInput = entry.querySelector('.label');

    function saveIfComplete() {
      if (subdomainInput.value && bgColorText.value && textColorText.value && labelInput.value && !isDuplicateSubdomain(subdomainInput.value)) {
        saveEntries();
        entry.classList.remove('unsaved');
      } else {
        entry.classList.add('unsaved');
      }
    }

    function suggestTextColor(bgColor) {
      const color = bgColor.replace('#', '');
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#FFFFFF';
    }

    function isValidColor(color) {
      const s = new Option().style;
      s.color = color;
      return s.color !== '';
    }

    function convertToHex(color) {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = color;
      return ctx.fillStyle;
    }

    function validateSubdomain(entry) {
      const subdomainInput = entry.querySelector('.subdomain');
      let subdomain = subdomainInput.value;

      // Check if the subdomain contains a single '-'
      if (subdomain.split('-').length === 2) {
        subdomainInput.classList.add('warning');
        if (!subdomainInput.nextElementSibling || !subdomainInput.nextElementSibling.classList.contains('warningIcon')) {
          const warningIcon = document.createElement('i');
          warningIcon.className = 'fas fa-exclamation-circle warningIcon';
          subdomainInput.parentNode.appendChild(warningIcon);
        }
      } else {
        subdomainInput.classList.remove('warning');
        const existingWarningIcon = subdomainInput.parentNode.querySelector('.warningIcon');
        if (existingWarningIcon) {
          existingWarningIcon.remove();
        }
      }

      // Existing validation logic
      if (isDuplicateSubdomain(subdomain)) {
        subdomainInput.classList.add('invalid');
        if (!subdomainInput.nextElementSibling || !subdomainInput.nextElementSibling.classList.contains('invalidIcon')) {
          const invalidIcon = document.createElement('i');
          invalidIcon.className = 'fas fa-question-circle invalidIcon';
          subdomainInput.parentNode.appendChild(invalidIcon);
        }
      } else {
        subdomainInput.classList.remove('invalid');
        const existingIcon = subdomainInput.parentNode.querySelector('.invalidIcon');
        if (existingIcon) {
          existingIcon.remove();
        }
      }
      saveIfComplete();
    }

    function capitalizeColor(color) {
      return color.toUpperCase();
    }

    bgColorText.addEventListener('input', () => {
      if (isValidColor(bgColorText.value)) {
        const hexColor = convertToHex(bgColorText.value);
        bgColorPicker.value = hexColor;
        if (entry.classList.contains('unsaved')) {
          textColorText.value = suggestTextColor(hexColor);
          textColorPicker.value = textColorText.value;
        }
      }
      capitalizeIfHash(bgColorText);
      if (!isValidColor(bgColorText.value)) {
        bgColorText.classList.add('invalid');
      } else {
        bgColorText.classList.remove('invalid');
        saveIfComplete();
        updateBanner();
      }
    });

    bgColorPicker.addEventListener('input', function () {
      const capitalizedColor = capitalizeColor(bgColorPicker.value);
      bgColorText.value = capitalizedColor;
      updateBanner();
    });

    textColorText.addEventListener('input', () => {
      if (isValidColor(textColorText.value)) {
        const hexColor = convertToHex(textColorText.value);
        textColorPicker.value = hexColor;
      }
      capitalizeIfHash(textColorText);
      textColorText.classList.toggle('invalid', !isValidColor(textColorText.value));
      if (isValidColor(textColorText.value)) {
        saveIfComplete();
        updateBanner();
      }
    });

    textColorPicker.addEventListener('input', function () {
      const capitalizedColor = capitalizeColor(textColorPicker.value);
      textColorText.value = capitalizedColor;
      updateBanner();
    });

    subdomainInput.addEventListener('input', () => {
      validateSubdomain(entry);
    });
    labelInput.addEventListener('input', () => {
      saveIfComplete();
      updateBanner();
    });

    subdomainInput.addEventListener('blur', handleSubdomainChange);
    subdomainInput.addEventListener('paste', (event) => {
      // Use a timeout to ensure the paste event has completed
      setTimeout(() => handleSubdomainChange({ target: subdomainInput }), 0);
    });

    function handleSubdomainChange(event) {
      const target = event.target || subdomainInput;
      let subdomain = target.value;

      try {
        const url = new URL(subdomain);
        subdomain = url.hostname.split('.')[0];
      } catch (e) {
        const hostname = subdomain.split('/')[0];
        subdomain = hostname.split('.')[0];
      }
      target.value = subdomain;

      // Set the label if it is blank
      if (labelInput.value.trim() === '') {
        const parts = subdomain.split('--');
        labelInput.value = parts.length > 1 ? parts[1].toUpperCase() : subdomain.toUpperCase();
      }
      validateSubdomain(entry);
      if (labelInput.value.trim() === '') {
        const parts = subdomain.split('--');
        labelInput.value = parts.length > 1 ? parts[1].toUpperCase() : subdomainInput.value.toUpperCase();
      }
    }

    // Add focus event listeners to update the banner when an entry is being edited
    [bgColorText, bgColorPicker, textColorText, textColorPicker, subdomainInput, labelInput].forEach(input => {
      input.addEventListener('focus', () => {
        updateBanner();
      });
    });

    const removeButton = entry.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      const entries = document.querySelectorAll('.entry');
      const index = Array.from(entries).indexOf(entry);

      entriesContainer.removeChild(entry);
      saveEntries();

      // Validate subdomains for remaining entries
      Array.from(entries).forEach((entry, i) => {
        if (i !== index) {
          validateSubdomain(entry);
        }
      });

      if (entries.length > 1) {
        if (index < entries.length - 1) {
          // Focus on the subdomain input of the following entry
          entries[index + 1].querySelector('.subdomain').focus();
        } else if (index > 0) {
          // Focus on the subdomain input of the prior entry
          entries[index - 1].querySelector('.subdomain').focus();
        }
      } else {
        // No entries left, call createBanner with no parameters
        addEntry();
      }
    });

    function updateBanner() {
      createBanner(labelInput.value || 'Label', bgColorText.value || 'red', textColorText.value || 'white');
    }

    entriesContainer.appendChild(entry);

    // Create and display the banner using the entry values
    updateBanner();
    validateSubdomain(entry);
    // Focus on the label input field after adding a new entry
    subdomainInput.focus();
  }

  function saveEntries() {
    const entries = [];
    document.querySelectorAll('.entry').forEach(entry => {
      const label = entry.querySelector('.label').value;
      const subdomain = entry.querySelector('.subdomain').value;
      const bgColor = entry.querySelector('.bg-color-text').value;
      const textColor = entry.querySelector('.text-color-text').value;
      if (subdomain && bgColor && textColor && !isDuplicateSubdomain(subdomain)) {
        entries.push({ label, subdomain, bgColor, textColor });
      }
    });
    chrome.storage.local.set({ entries });
  }

  function isDuplicateSubdomain(subdomain) {
    if (!subdomain) {
      return false;
    }
    const entries = document.querySelectorAll('.entry .subdomain');
    let count = 0;
    entries.forEach(entry => {
      if (entry.value === subdomain) {
        count++;
      }
    });
    return count > 1;
  }

  function capitalizeIfHash(input) {
    if (input.value.startsWith('#')) {
      input.value = input.value.toUpperCase();
    }
  }
});