// Color utilities for handling color validation, conversion, and suggestion
const ColorUtils = {
  /**
   * Checks if a string represents a valid CSS color
   * @param {string} color - The color string to validate
   * @returns {boolean} True if the color is valid, false otherwise
   */
  isValidColor: (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  },

  /**
   * Capitalizes a hex color code if it starts with #
   * @param {HTMLInputElement} input - Input element containing the color value
   */
  capitalizeIfHash: (input) => {
    if (input.value.startsWith('#')) {
      input.value = input.value.toUpperCase();
    }
  },

  /**
   * Converts a color string to its hex representation
   * @param {string} color - The color to convert
   * @returns {string} The hex representation of the color
   */
  convertToHex: (color) => {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    return ctx.fillStyle;
  },

  /**
   * Suggests a text color (black or white) based on the background color brightness
   * @param {string} bgColor - The background color in hex format
   * @returns {string} Either 'Black' or 'White' depending on background brightness
   */
  suggestTextColor: (bgColor) => {
    const color = bgColor.replace('#', '');
    const r = Number.parseInt(color.substring(0, 2), 16);
    const g = Number.parseInt(color.substring(2, 4), 16);
    const b = Number.parseInt(color.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'Black' : 'White';
  },

  /**
   * Capitalizes a color value
   * @param {string} color - The color value to capitalize
   * @returns {string} The capitalized color value
   */
  capitalizeColor: (color) => {
    return color.toUpperCase();
  },

  /**
   * Determines a semi-transparent contrast color for gradient patterns
   * @param {string} bgColor - The background color
   * @returns {string} A semi-transparent contrast color for gradients
   */
  getContrastColor: (bgColor) => {
    const hex = bgColor.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    const transparency = 0.1; // Fixed transparency value
    return (yiq >= 128) ? `rgba(0, 0, 0, ${transparency})` : `rgba(255, 255, 255, ${transparency})`;
  }
};

const boldColors = [
  'Crimson', 'DodgerBlue', 'DarkOrange', 'ForestGreen', 'Gold', 'HotPink', 'MediumPurple', 'Tomato', 'Turquoise',
  'DeepPink', 'LimeGreen', 'RoyalBlue', 'OrangeRed', 'MediumVioletRed', 'SpringGreen', 'SteelBlue', 'DarkMagenta',
  'DarkTurquoise', 'FireBrick', 'GoldenRod', 'Indigo', 'LightSeaGreen', 'Magenta', 'MediumOrchid', 'MediumSeaGreen',
  'MediumSlateBlue', 'Navy', 'OliveDrab', 'Orange', 'Orchid', 'PaleVioletRed', 'Peru', 'Plum', 'RebeccaPurple',
  'Salmon', 'SandyBrown', 'SeaGreen', 'Sienna', 'SlateBlue', 'SlateGray', 'Teal', 'Thistle', 'Violet', 'YellowGreen',
  'Chartreuse', 'Coral', 'DarkCyan', 'DarkGoldenRod', 'DarkKhaki', 'DarkOliveGreen', 'Aqua', 'Aquamarine', 'BlueViolet',
  'Brown', 'CadetBlue', 'Chocolate', 'CornflowerBlue', 'Cyan', 'DarkBlue', 'DarkGray', 'DarkGreen', 'DarkOrchid',
  'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DeepSkyBlue', 'DimGray', 'FloralWhite',
  'Fuchsia', 'Gainsboro', 'GhostWhite', 'GreenYellow', 'HoneyDew', 'IndianRed', 'Ivory', 'Khaki', 'Lavender',
  'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow',
  'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue',
  'LightYellow', 'Lime', 'Linen', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'Alizarin', 'Amethyst', 'Bittersweet',
  'Celeste', 'Cerulean', 'ElectricBlue', 'Flame', 'JazzberryJam', 'MangoTango', 'Mauvelous', 'NeonCarrot', 'OuterSpace',
  'PeachPuff', 'Razzmatazz', 'Saffron', 'SeaFoam', 'ShockingPink', 'Tangerine', 'UltraMarine', 'Zaffre'
];

const TableManager = {
  tableContainer: document.querySelector('.tabcontent'),
  bannerPlaceholder: document.getElementById('banner-placeholder'),
  isDuplicateSubdomain: (subdomain) => {
    if (!subdomain) {
      return false;
    }
    const entries = document.querySelectorAll('.entry .subdomain');
    let count = 0;
    for (const entry of entries) {
      if (entry.value.trim().toLowerCase() === subdomain.trim().toLowerCase()) {
        count++;
      }
    }
    return count > 1;
  },
  saveEntries: function () {
    /**
     * Collects entries from the UI, validates them, and saves to storage
     * Entries are sorted by their tab order before saving
     */
    const entries = [];
    const tabOrder = TabManager.getTabOrder();
    
    // Collect all valid entries from the DOM
    const entryElements = document.querySelectorAll('.entry');
    for (const entryElement of entryElements) {
      const entry = this.extractEntryData(entryElement);
      
      // Only save entries that have all required fields and no duplicates
      if (this.isValidEntry(entry)) {
        entries.push(entry);
      }
    }

    // Sort entries based on tab order
    entries.sort((a, b) => tabOrder.indexOf(a.tabname) - tabOrder.indexOf(b.tabname));
    
    // Save to Chrome storage
    chrome.storage.local.set({ entries });
  },
  
  /**
   * Extracts entry data from a DOM element
   * @param {HTMLElement} entryElement - The DOM element containing entry data
   * @returns {Object} The extracted entry data
   */
  extractEntryData: (entryElement) => {
    const tableId = entryElement.closest('table').id;
    const guid = tableId.replace('entries-table-', '');
    const tabName = TabManager.getTabNameByGUID(guid);
    
    return {
      label: entryElement.querySelector('.label').value,
      subdomain: entryElement.querySelector('.subdomain').value,
      bgColor: entryElement.querySelector('.bg-color-text').value,
      textColor: entryElement.querySelector('.text-color-text').value,
      tabname: tabName
    };
  },
  
  /**
   * Validates if an entry has all required fields and no duplicate subdomain
   * @param {Object} entry - The entry to validate
   * @returns {boolean} True if entry is valid, false otherwise
   */
  isValidEntry: function(entry) {
    return entry.subdomain && 
           entry.bgColor && 
           entry.textColor && 
           !this.isDuplicateSubdomain(entry.subdomain);
  },

  getTabGUIDByName(tabName) {
    const tab = Array.from(this.tableContainer.querySelectorAll('.tablinks')).find(tab => {
      const input = tab.querySelector('.tab-input');
      return input && input.value === tabName;
    });
    return tab ? tab.getAttribute('data-guid') : null;
  },

  addNewTable(guid) {
    // Hide all existing tables
    const existingTables = document.querySelectorAll('table[id^="entries-table-"]');
    for (const table of existingTables) {
      table.style.display = 'none';
    }

    if (!this.tableExists(guid)) {
      const newTable = document.createElement('div');
      newTable.className = 'tabcontent';
      newTable.setAttribute('data-guid', guid);
      newTable.innerHTML = `
        <table id="entries-table-${guid}">
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Subdomain*</th>
              <th>Label</th>
              <th>Background Color*</th>
              <th>Text Color*</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="entries-${guid}"></tbody>
        </table>
      `;
      this.tableContainer.appendChild(newTable);
      // Add drag-and-drop functionality to the table body
      this.addDragAndDropToTableBody(`#entries-${guid}`);
    }
  },

  addDragAndDropToTableBody(tableBodyId) {
    const tableBody = document.querySelector(tableBodyId);
    let draggingRow = null;
    let isDraggingFromInput = false; // Flag to track if the drag started from an input field

    // Add mousedown listener to track input interactions
    tableBody.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.closest('input')) {
        isDraggingFromInput = true; // Set flag if mousedown originated from an input
      } else {
        isDraggingFromInput = false; // Reset flag otherwise
      }
    });

    // Add drag-and-drop listeners to the tbody
    tableBody.addEventListener('dragstart', (e) => {
      // Check if dragging started from an input
      if (isDraggingFromInput) {
        e.preventDefault(); // Prevent dragging
        return;
      }

      if (e.target?.classList.contains('entry') && !isDraggingFromInput) {
        draggingRow = e.target;
        draggingRow.classList.add('dragging');
      }
    });

    tableBody.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow drop
      if (!draggingRow) return; // Prevent if not dragging a row

      const afterElement = getDragAfterElement(tableBody, e.clientY);

      if (afterElement == null) {
        tableBody.appendChild(draggingRow);
      } else {
        tableBody.insertBefore(draggingRow, afterElement);
      }
    });

    tableBody.addEventListener('drop', (e) => {
      if (draggingRow) {
        draggingRow.classList.remove('dragging');
        const subdomainInput = draggingRow.querySelector('.subdomain');
        if (subdomainInput) {
          subdomainInput.focus();
        }
        draggingRow = null; // Reset the draggingRow
      }
      this.saveEntries(); // Save the entries after reordering
    });

    // Helper to determine where to drop the dragged row
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.entry:not(.dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  },

  tableExists(guid) {
    return !!this.tableContainer.querySelector(`div[data-guid="${guid}"]`);
  },

  addEntry(guid, entryData = {}) {
    const effectiveGuid = guid || TabManager.getActiveTab() || TabManager.addNewTab("Default");
    const tableBody = document.getElementById(`entries-${effectiveGuid}`);
    const entry = document.createElement('tr');
    entry.className = 'entry';
    entry.setAttribute('draggable', 'true');
    const usedColors = Array.from(document.querySelectorAll('.entry .bg-color-text')).map(input => input.value);
    const availableColors = boldColors.filter(color => !usedColors.includes(color));
    const bgColor = entryData.bgColor || (availableColors.length > 0 ? availableColors[0] : 'DodgerBlue');
    const bgColorHex = ColorUtils.convertToHex(entryData.bgColor || bgColor);
    const textColor = ColorUtils.suggestTextColor(bgColorHex);

    entry.innerHTML = `
      <td class="drag-handle"><i class="fas fa-bars"></i><input type="hidden" class="tab" value="${entryData.tab || ''}"></td>
      <td><input type="text" placeholder="Subdomain" class="subdomain" value="${entryData.subdomain || ''}"></td>
      <td><input type="text" placeholder="Label" class="label" value="${entryData.label || ''}"></td>
      <td>
        <div class="color-input">
          <input type="text" placeholder="Background Color" class="bg-color-text" value="${bgColor}">
          <input type="color" class="bg-color-picker" value="${ColorUtils.convertToHex(bgColor)}">
        </div>
      </td>
      <td>
        <div class="color-input">
          <input type="text" placeholder="Text Color" class="text-color-text" value="${textColor}">
          <input type="color" class="text-color-picker" value="${ColorUtils.convertToHex(textColor)}">
        </div>
      </td>
      <td><button class="remove-button"><i class="fas fa-trash-alt"></i></button></td>
    `;
    if (Object.keys(entryData).length === 0) {
      // Adding a new empty entry
      entry.classList.add('unsaved');
      tableBody.appendChild(entry);
    } else {
      // Adding an entry with data
      tableBody.appendChild(entry);
    }

    const bgColorText = entry.querySelector('.bg-color-text');
    const bgColorPicker = entry.querySelector('.bg-color-picker');
    const textColorText = entry.querySelector('.text-color-text');
    const textColorPicker = entry.querySelector('.text-color-picker');
    const subdomainInput = entry.querySelector('.subdomain');
    const labelInput = entry.querySelector('.label');

    bgColorText.addEventListener('input', () => {
      if (ColorUtils.isValidColor(bgColorText.value)) {
        const hexColor = ColorUtils.convertToHex(bgColorText.value);
        bgColorPicker.value = hexColor;
        if (entry.classList.contains('unsaved')) {
          textColorText.value = ColorUtils.suggestTextColor(hexColor);
          textColorPicker.value = textColorText.value;
        }
      }
      ColorUtils.capitalizeIfHash(bgColorText);
      if (!ColorUtils.isValidColor(bgColorText.value)) {
        bgColorText.classList.add('invalid');
      } else {
        bgColorText.classList.remove('invalid');
        saveIfComplete();
        updateBanner();
      }
    });

    bgColorPicker.addEventListener('input', () => {
      const capitalizedColor = ColorUtils.capitalizeColor(bgColorPicker.value);
      bgColorText.value = capitalizedColor;
      saveIfComplete();
      updateBanner();
    });

    textColorText.addEventListener('input', () => {
      if (ColorUtils.isValidColor(textColorText.value)) {
        const hexColor = ColorUtils.convertToHex(textColorText.value);
        textColorPicker.value = hexColor;
      }
      ColorUtils.capitalizeIfHash(textColorText);
      textColorText.classList.toggle('invalid', !ColorUtils.isValidColor(textColorText.value));
      if (ColorUtils.isValidColor(textColorText.value)) {
        saveIfComplete();
        updateBanner();
      }
    });

    textColorPicker.addEventListener('input', () => {
      const capitalizedColor = ColorUtils.capitalizeColor(textColorPicker.value);
      textColorText.value = capitalizedColor;
      saveIfComplete();
      updateBanner();
    });

    subdomainInput.addEventListener('input', () => {
      validateSubdomain(entry);
      saveIfComplete();
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

    // Add focus event listeners to update the banner when an entry is being edited
    for (const input of [bgColorText, bgColorPicker, textColorText, textColorPicker, subdomainInput, labelInput]) {
      input.addEventListener('focus', () => {
        updateBanner();
      });
    }

    // Create and display the banner using the entry values
    updateBanner();
    validateSubdomain(entry);
    // Scroll the new entry into view
    addEntryButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    // Focus on the label input field after adding a new entry
    subdomainInput.focus();

    const removeButton = entry.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
      const entries = document.querySelectorAll('.entry');
      const index = Array.from(entries).indexOf(entry);

      tableBody.removeChild(entry);
      this.saveEntries();

      // Validate subdomains for remaining entries
      for (const entry of Array.from(entries)) {
        if (Array.from(entries).indexOf(entry) !== index) {
          validateSubdomain(entry);
        }
      }

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
        this.addEntry();
      }
    });

    function updateBanner() {
      createBanner(labelInput.value || 'Label', bgColorText.value || 'red', textColorText.value || 'white');
    }

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

    function saveIfComplete() {
      if (subdomainInput.value && bgColorText.value && textColorText.value) {
        // If label is empty but subdomain has value, auto-populate the label
        if (!labelInput.value && subdomainInput.value) {
          const parts = subdomainInput.value.split('--');
          labelInput.value = parts.length > 1 ? parts[1].toUpperCase() : subdomainInput.value.toUpperCase();
        }
        
        // Now check if we can save
        if (labelInput.value && !TableManager.isDuplicateSubdomain(subdomainInput.value)) {
          TableManager.saveEntries();
          entry.classList.remove('unsaved');
        } else {
          entry.classList.add('unsaved');
        }
      } else {
        entry.classList.add('unsaved');
      }
    }

    function validateSubdomain(entry) {
      const subdomainInput = entry.querySelector('.subdomain');
      const subdomain = subdomainInput.value;

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
      if (TableManager.isDuplicateSubdomain(subdomain)) {
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
    }

    function createBanner(text = 'Label', bgColor = 'gray', textColor = 'white') {
      // Remove any existing banner to avoid duplicates
      const existingBanner = document.querySelector(".oneSystemMessage.banner");
      if (existingBanner) {
        existingBanner.remove();
      }

      // Determine the gradient color based on the background color
      const gradientColor = ColorUtils.getContrastColor(bgColor);

      // Create a new banner element
      const banner = document.createElement("div");
      banner.className = "slds-notify_alert slds-notify--alert oneSystemMessage banner";

      // Apply explicit styles to ensure visibility and correct layout
      Object.assign(banner.style, {
        position: "fixed", 
        top: "0",
        left: "0",
        display: "block",
        width: "100%",
        padding: "0.5rem 2rem",
        color: textColor,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: bgColor,
        backgroundImage: `linear-gradient(45deg, ${gradientColor} 25%, transparent 25%, transparent 50%, ${gradientColor} 50%, ${gradientColor} 75%, transparent 75%, transparent)`,
        backgroundSize: "64px 64px",
        zIndex: "10000",
        boxSizing: "border-box",
      });

      // Add content to the banner
      banner.textContent = text;

      // Insert the banner into the banner-placeholder element
      const bannerPlaceholder = document.getElementById('banner-placeholder');
      if (bannerPlaceholder) {
        bannerPlaceholder.appendChild(banner);
      }
    }

  },
};

const TabManager = {
  tabContainer: document.querySelector('.tab'),
  
  /**
   * Gets the GUID of the currently active tab
   * @returns {string|null} The GUID of the active tab, or null if no tab is active
   */
  getActiveTab() {
    const activeTab = this.tabContainer.querySelector('.tablinks.active:not(#newTab)');
    return activeTab ? activeTab.getAttribute('data-guid') : null;
  },
  
  /**
   * Gets the order of tabs based on their position in the DOM
   * @returns {Array<string>} Array of tab names in order
   */
  getTabOrder() {
    const tabs = Array.from(this.tabContainer.querySelectorAll('.tablinks:not(#newTab)'));
    return tabs.map(tab => {
      const input = tab.querySelector('.tab-input');
      return input ? input.value : null;
    }).filter(name => name !== null);
  },
  
  /**
   * Checks if a tab with the given name exists
   * @param {string} tabName - The name of the tab to check
   * @returns {string|null} The GUID of the tab if it exists, otherwise null
   */
  tabExists(tabName) {
    const tab = Array.from(this.tabContainer.children).find(tab => {
      const input = tab.querySelector('.tab-input');
      return input && input.value === tabName;
    });
    return tab ? tab.getAttribute('data-guid') : null;
  },
  
  /**
   * Gets the GUID of a tab by its name
   * @param {string} tabName - The name of the tab
   * @returns {string|null} The GUID of the tab if found, otherwise null
   */
  getTabGUIDByName(tabName) {
    const tab = Array.from(this.tabContainer.querySelectorAll('.tablinks')).find(tab => {
      const input = tab.querySelector('.tab-input');
      return input && input.value === tabName;
    });
    return tab ? tab.getAttribute('data-guid') : null;
  },
  
  /**
   * Generates a random GUID for a new tab
   * @returns {string} A new GUID
   */
  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  /**
   * Gets the name of a tab by its GUID
   * @param {string} guid - The GUID of the tab
   * @returns {string|null} The name of the tab if found, otherwise null
   */
  getTabNameByGUID(guid) {
    const tab = this.tabContainer.querySelector(`.tablinks[data-guid="${guid}"]`);
    if (!tab) return null;
    
    const input = tab.querySelector('.tab-input');
    return input ? input.value : null;
  },

  /**
   * Ensures the plus tab is always at the end of the tab container
   */
  movePlusTabToEnd() {
    const plusTab = this.tabContainer.querySelector('#newTab');
    if (plusTab?.textContent.includes('+')) {
      this.tabContainer.appendChild(plusTab);
    }
  },

  /**
   * Determines where to place a tab during drag operations
   * @param {HTMLElement} container - The container element
   * @param {number} x - The horizontal position of the cursor
   * @returns {HTMLElement|null} The element to place the dragged tab after
   */
  getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.tablinks[draggable="true"]:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  },

  /**
   * Adds drag-and-drop functionality to a tab
   * @param {HTMLElement} tab - The tab element to add drag-and-drop to
   */
  addDragAndDrop(tab) {
    let draggingTab = null;

    // Drag start event - store the dragged tab and add dragging class
    tab.addEventListener('dragstart', (e) => {
      draggingTab = tab;
      tab.classList.add('dragging');
    });

    // Drag end event - cleanup after dragging is done
    tab.addEventListener('dragend', () => {
      draggingTab = null;
      tab.classList.remove('dragging');
      clearInterval(this.scrollInterval); // Use this.scrollInterval instead
      TableManager.saveEntries();
    });

    // Handle dragging entries between tabs
    tab.addEventListener('dragover', (e) => {
      const draggingRow = document.querySelector('.entry.dragging');
      if (draggingRow) {
        const tableId = draggingRow.closest('table').id;
        const guid = tableId.replace('entries-table-', '');
        const tabGUID = tab.getAttribute('data-guid');
        
        // Only move if dragging to a different tab
        if (tabGUID !== guid) {
          const tableBody = document.getElementById(`entries-${tabGUID}`);
          
          // Position before unsaved rows if present
          const unsavedRows = tableBody.querySelectorAll('.entry.unsaved');
          if (unsavedRows.length > 0) {
            tableBody.insertBefore(draggingRow, unsavedRows[0]);
          } else {
            tableBody.appendChild(draggingRow);
          }
          TableManager.saveEntries();
        }
        e.preventDefault();
      }
    });

    // Setup container-level drag handling for tab reordering
    this.tabContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      
      // Determine where to place the dragged tab
      const afterElement = this.getDragAfterElement(this.tabContainer, e.clientX);
      if (draggingTab instanceof Node) {
        if (afterElement == null) {
          this.tabContainer.appendChild(draggingTab);
        } else {
          this.tabContainer.insertBefore(draggingTab, afterElement);
        }
        // Keep the plus tab at the end
        this.movePlusTabToEnd();
      }

      // Auto-scroll when dragging near the edges
      this.handleAutoScroll(e);
    });

    // Clear scroll interval when dragging ends
    this.tabContainer.addEventListener('drop', () => {
      clearInterval(scrollInterval);
    });
  },
  
  /**
   * Handles auto-scrolling during drag operations
   * @param {DragEvent} e - The drag event
   */
  handleAutoScroll(e) {
    // Store the scroll interval in the TabManager object
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
    
    const containerRect = this.tabContainer.getBoundingClientRect();
    
    // Auto-scroll when near left edge
    if (e.clientX < containerRect.left + 50) {
      this.scrollInterval = setInterval(() => {
        this.tabContainer.scrollBy({ left: -100, behavior: 'smooth' });
      }, 100);
    } 
    // Auto-scroll when near right edge
    else if (e.clientX > containerRect.right - 50) {
      this.scrollInterval = setInterval(() => {
        this.tabContainer.scrollBy({ left: 100, behavior: 'smooth' });
      }, 100);
    }
  },

  /**
   * Adds a new tab to the tab container
   * @param {string} newTabName - The name of the new tab, defaults to 'New'
   * @returns {string} The GUID of the new tab
   */
  addNewTab(newTabName = 'New') {
    const plusTabButton = this.tabContainer.querySelector('#newTab');
    let counter = 1;
    let uniqueTabName = newTabName;

    // Generate a unique tab name
    while (Array.from(this.tabContainer.children).some(tab => 
      tab.querySelector('.tab-input') && tab.querySelector('.tab-input').value === uniqueTabName)) {
      uniqueTabName = `New ${counter}`;
      counter++;
    }

    // Deactivate current tab
    const currentActiveTab = document.querySelector('.tablinks.active');
    if (currentActiveTab) {
      currentActiveTab.classList.remove('active');
    }

    // Create new tab with unique GUID
    const tabGUID = this.generateGUID();
    const newTabButton = this.createTabElement(uniqueTabName, tabGUID);

    // Insert before plus button and scroll to view
    this.tabContainer.insertBefore(newTabButton, plusTabButton);
    plusTabButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

    // Setup drag and drop and create table
    this.addDragAndDrop(newTabButton);
    TableManager.addNewTable(tabGUID);

    // Setup input handling for validation
    this.setupTabInputHandlers(newTabButton);
    
    // Setup click handler for tab activation
    this.setupTabClickHandler(newTabButton);
    
    return tabGUID;
  },
  
  /**
   * Creates a tab DOM element
   * @param {string} tabName - The name of the tab
   * @param {string} tabGUID - The GUID for the tab
   * @returns {HTMLElement} The created tab element
   */
  createTabElement(tabName, tabGUID) {
    const newTabButton = document.createElement('button');
    newTabButton.className = 'tablinks active';
    newTabButton.setAttribute('draggable', 'true');
    newTabButton.setAttribute('data-guid', tabGUID);
    newTabButton.innerHTML = `
      <i class="fas fa-grip-lines-vertical"></i>
      <input type="text" class="tab-input" value="${tabName}">
    `;
    return newTabButton;
  },
  
  /**
   * Sets up input validation handlers for tab name inputs
   * @param {HTMLElement} tabElement - The tab element to set up handlers for
   */
  setupTabInputHandlers(tabElement) {
    const tabInput = tabElement.querySelector('.tab-input');
    if (!tabInput) return;
    
    // Get all tab inputs for duplicate checking
    const allTabInputs = document.querySelectorAll('.tab-input');
    
    // Input event for validation and storage update
    tabInput.addEventListener('input', (e) => {
      const currentValue = e.target.value.trim().toLowerCase();
      
      // Check for duplicate tab names
      let isDuplicate = false;
      for (const otherInput of allTabInputs) {
        if (otherInput !== e.target && otherInput.value.trim().toLowerCase() === currentValue) {
          isDuplicate = true;
          break;
        }
      }
      
      // Handle validation UI
      if (isDuplicate) {
        this.markInputAsInvalid(e.target);
      } else {
        this.markInputAsValid(e.target);
        TableManager.saveEntries();
      }
    });
    
    // Special handling for spaces in tab names
    tabInput.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();

        // Insert space at cursor position
        const cursorPosition = tabInput.selectionStart;
        const currentValue = tabInput.value;
        tabInput.value = `${currentValue.slice(0, cursorPosition)} ${currentValue.slice(cursorPosition)}`;
        
        // Move cursor after inserted space
        tabInput.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }
    });
  },
  
  /**
   * Marks an input as invalid with visual indicator
   * @param {HTMLInputElement} input - The input to mark as invalid
   */
  markInputAsInvalid(input) {
    input.classList.add('invalid');
    if (!input.nextElementSibling?.classList.contains('invalidIcon')) {
      const invalidIcon = document.createElement('i');
      invalidIcon.className = 'fas fa-question-circle invalidIcon';
      input.parentNode.appendChild(invalidIcon);
    }
  },
  
  /**
   * Marks an input as valid, removing any validation indicators
   * @param {HTMLInputElement} input - The input to mark as valid
   */
  markInputAsValid(input) {
    input.classList.remove('invalid');
    const existingIcon = input.parentNode.querySelector('.invalidIcon');
    if (existingIcon) {
      existingIcon.remove();
    }
  },
  
  /**
   * Sets up click handler for tab activation
   * @param {HTMLElement} tabElement - The tab element to set up handler for
   */
  setupTabClickHandler(tabElement) {
    tabElement.addEventListener('click', (event) => {
      // Deactivate all tabs
      const allTabs = this.tabContainer.querySelectorAll('.tablinks');
      for (const tab of allTabs) {
        tab.classList.remove('active');
      }

      // Activate clicked tab
      tabElement.classList.add('active');
      const tabGUID = tabElement.getAttribute('data-guid');

      // Show corresponding table and hide others
      const allTables = document.querySelectorAll('table[id^="entries-table-"]');
      for (const table of allTables) {
        const isCurrentTable = table.id === `entries-table-${tabGUID}`;
        table.style.display = isCurrentTable ? 'block' : 'none';
        
        // Focus on last row if not clicking in input
        if (isCurrentTable && event.target.tagName.toLowerCase() !== 'input') {
          const lastRow = table.querySelector('tbody tr:last-child .subdomain');
          if (lastRow) {
            lastRow.focus();
          }
        }
      }
    });
  }
};


/**
 * Main application initialization
 * Responsible for setting up event handlers and loading data
 */
const AppInitializer = {
  /**
   * Initialize the application
   * Sets up event handlers and loads data from storage
   */
  init() {
    this.setupScrolling();
    this.setupOptionsMenu();
    this.setupTabHandlers();
    this.loadStoredEntries();
    this.setupAddEntryButton();
  },

  /**
   * Sets up tab container scrolling functionality
   */
  setupScrolling() {
    const tabContainer = document.querySelector('.tab');
    const scrollLeftButton = document.querySelector('.scroll-button.left');
    const scrollRightButton = document.querySelector('.scroll-button.right');
    
    // Simple click scroll
    scrollLeftButton.addEventListener('click', () => {
      tabContainer.scrollBy({ left: -150, behavior: 'smooth' });
    });
    
    scrollRightButton.addEventListener('click', () => {
      tabContainer.scrollBy({ left: 150, behavior: 'smooth' });
    });
    
    // Continuous scroll with mousedown
    let scrollLeftInterval;
    let scrollRightInterval;
    
    scrollLeftButton.addEventListener('mousedown', () => {
      scrollLeftInterval = setInterval(() => {
        tabContainer.scrollBy({ left: -100, behavior: 'smooth' });
      }, 100);
    });
    
    scrollRightButton.addEventListener('mousedown', () => {
      scrollRightInterval = setInterval(() => {
        tabContainer.scrollBy({ left: 100, behavior: 'smooth' });
      }, 100);
    });
    
    // Stop scrolling on mouseup or mouseleave
    scrollLeftButton.addEventListener('mouseup', () => clearInterval(scrollLeftInterval));
    scrollLeftButton.addEventListener('mouseleave', () => clearInterval(scrollLeftInterval));
    scrollRightButton.addEventListener('mouseup', () => clearInterval(scrollRightInterval));
    scrollRightButton.addEventListener('mouseleave', () => clearInterval(scrollRightInterval));
  },
  
  /**
   * Sets up the options menu functionality
   */
  setupOptionsMenu() {
    const optionsButton = document.getElementById('optionsButton');
    const optionsMenu = document.getElementById('optionsMenu');
    const useTabGroupsToggle = document.getElementById('useTabGroupsToggle');
    const tabGroupsOption = document.getElementById('tabGroupsOption');
    
    // Load stored tab groups preference
    chrome.storage.local.get('useTabGroups', (result) => {
      useTabGroupsToggle.checked = result.useTabGroups || false;
    });
    
    // Save tab groups preference when changed
    useTabGroupsToggle.addEventListener('change', () => {
      chrome.storage.local.set({ useTabGroups: useTabGroupsToggle.checked });
    });
    
    // Toggle tab groups option
    tabGroupsOption.addEventListener('click', () => {
      useTabGroupsToggle.checked = !useTabGroupsToggle.checked;
      chrome.storage.local.set({ useTabGroups: useTabGroupsToggle.checked });
    });
    
    // Toggle menu visibility
    optionsButton.addEventListener('click', () => {
      optionsMenu.classList.toggle('hidden');
      
      // Position menu relative to button
      const buttonRect = optionsButton.getBoundingClientRect();
      optionsMenu.style.top = `${buttonRect.bottom}px`;
      optionsMenu.style.left = `${buttonRect.left}px`;
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!optionsButton.contains(event.target) && !optionsMenu.contains(event.target)) {
        optionsMenu.classList.add('hidden');
      }
    });
    
    // Setup import/export functionality
    this.setupImportExport();
  },
  
  /**
   * Sets up import and export functionality
   */
  setupImportExport() {
    const importOption = document.getElementById('importOption');
    const exportOption = document.getElementById('exportOption');
    const optionsMenu = document.getElementById('optionsMenu');
    
    // Import entries from JSON file
    importOption.addEventListener('click', () => {
      optionsMenu.classList.add('hidden');
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json';
      
      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            this.handleImportedData(e.target.result);
          } catch (error) {
            alert(`Error parsing JSON: ${error.message}`);
          }
        };
        reader.readAsText(file);
      });
      
      fileInput.click();
    });
    
    // Export entries to JSON file
    exportOption.addEventListener('click', () => {
      optionsMenu.classList.add('hidden');
      
      chrome.storage.local.get('entries', (result) => {
        if (result.entries) {
          const json = JSON.stringify(result.entries, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'salesforce-org-banner.json';
          a.click();
          
          URL.revokeObjectURL(url);
        }
      });
    });
  },
  
  /**
   * Process imported JSON data
   * @param {string} jsonData - JSON string containing entries to import
   */
  handleImportedData(jsonData) {
    const entries = JSON.parse(jsonData);
    
    if (!Array.isArray(entries)) {
      alert('Invalid JSON format: Expected an array of entries.');
      return;
    }
    
    // Track existing entries to avoid duplicates
    const existingEntries = {};
    for (const input of document.querySelectorAll('.entry .subdomain')) {
      existingEntries[input.value.trim().toLowerCase()] = input.closest('.entry');
    }
    
    let invalidEntriesCount = 0;
    
    for (const entry of entries) {
      if (this.isValidImportEntry(entry)) {
        const subdomainKey = entry.subdomain.trim().toLowerCase();
        let tabGUID = TabManager.getTabGUIDByName(entry.tabname || 'Default');
        
        if (!tabGUID) {
          tabGUID = TabManager.addNewTab(entry.tabname || 'Default');
        }
        
        if (existingEntries[subdomainKey]) {
          this.updateExistingEntry(existingEntries[subdomainKey], entry);
        } else {
          TableManager.addEntry(tabGUID, entry);
        }
      } else {
        invalidEntriesCount++;
      }
    }
    
    if (invalidEntriesCount > 0) {
      alert(`${invalidEntriesCount} entries were in an invalid format and were not imported.`);
    }
    
    TableManager.saveEntries();
  },
  
  /**
   * Checks if an imported entry has all required fields
   * @param {Object} entry - The entry to validate
   * @returns {boolean} True if entry is valid for import
   */
  isValidImportEntry(entry) {
    return entry.bgColor && entry.label && entry.subdomain && entry.textColor;
  },
  
  /**
   * Updates an existing entry with imported data
   * @param {HTMLElement} existingEntryElement - The existing entry element
   * @param {Object} importedEntry - Data to update with
   */
  updateExistingEntry(existingEntryElement, importedEntry) {
    existingEntryElement.querySelector('.label').value = importedEntry.label;
    existingEntryElement.querySelector('.bg-color-text').value = importedEntry.bgColor;
    existingEntryElement.querySelector('.text-color-text').value = importedEntry.textColor;
  },
  
  /**
   * Sets up tab handling functionality
   */
  setupTabHandlers() {
    const tabContainer = document.querySelector('.tab');
    const plusTabButton = tabContainer.querySelector('#newTab');
    
    // New tab button handler
    plusTabButton.addEventListener('click', () => {
      TabManager.addNewTab();
      TableManager.addEntry();
    });
    
    // Setup drag-and-drop for existing tabs
    const tabs = tabContainer.querySelectorAll('.tablinks[draggable="true"]');
    for (const tab of tabs) {
      TabManager.addDragAndDrop(tab);
    }
  },
  
  /**
   * Loads entries from storage
   */
  loadStoredEntries() {
    chrome.storage.local.get('entries', (result) => {
      if (result.entries && result.entries.length > 0) {
        this.populateEntriesFromStorage(result.entries);
      } else {
        TableManager.addEntry(); // Add a blank entry if no entries are found
      }
      
      // Activate the first tab and its corresponding table
      this.activateFirstTab();
    });
  },
  
  /**
   * Populates entries from storage data
   * @param {Array} entries - Array of entry objects from storage
   */
  populateEntriesFromStorage(entries) {
    let previousTabName = null;
    
    for (const entryData of entries) {
      if (!entryData.tabname) {
        entryData.tabname = "Default";
      }
      
      // Create a new empty entry when switching tabs
      if (previousTabName !== null && previousTabName !== entryData.tabname) {
        TableManager.addEntry();
      }
      
      let tabGUID = TabManager.getTabGUIDByName(entryData.tabname);
      if (!tabGUID) {
        tabGUID = TabManager.addNewTab(entryData.tabname);
      }
      
      TableManager.addEntry(tabGUID, entryData);
      previousTabName = entryData.tabname;
    }
    
    TableManager.addEntry(); // Add a blank entry for new entries
  },
  
  /**
   * Activates the first tab in the tab container
   */
  activateFirstTab() {
    const tabContainer = document.querySelector('.tab');
    const firstTab = tabContainer.querySelector('.tablinks:not(#newTab)');
    if (firstTab) {
      firstTab.click();
    }
  },
  
  /**
   * Sets up the Add Entry button functionality
   */
  setupAddEntryButton() {
    const addEntryButton = document.getElementById('addEntryButton');
    if (addEntryButton) {
      addEntryButton.addEventListener('click', () => {
        TableManager.addEntry();
      });
    }
  }
};

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  AppInitializer.init();
});