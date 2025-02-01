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
  isDuplicateSubdomain: function (subdomain) {
    if (!subdomain) {
      return false;
    }
    const entries = document.querySelectorAll('.entry .subdomain');
    let count = 0;
    entries.forEach(entry => {
      if (entry.value.trim().toLowerCase() === subdomain.trim().toLowerCase()) {
        count++;
      }
    });
    return count > 1;
  },
  saveEntries: function () {
    // Clear existing entries
    const entries = [];
    const tabOrder = TabManager.getTabOrder(); // Assuming this method returns the tabs in the correct order

    document.querySelectorAll('.entry').forEach(entry => {
      const tableId = entry.closest('table').id;
      const guid = tableId.replace('entries-table-', '');
      const tabName = TabManager.getTabNameByGUID(guid);
      const label = entry.querySelector('.label').value;
      const subdomain = entry.querySelector('.subdomain').value;
      const bgColor = entry.querySelector('.bg-color-text').value;
      const textColor = entry.querySelector('.text-color-text').value;
      if (subdomain && bgColor && textColor && !this.isDuplicateSubdomain(subdomain)) {
        entries.push({ label, subdomain, bgColor, textColor, tabname: tabName });
      }
    });

    // Sort entries based on tab order
    entries.sort((a, b) => tabOrder.indexOf(a.tabname) - tabOrder.indexOf(b.tabname));
    chrome.storage.local.set({ entries }, () => {
    });
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
    existingTables.forEach(table => {
      table.style.display = 'none';
    });

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

      if (e.target && e.target.classList.contains('entry') && !isDraggingFromInput) {
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
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  },

  tableExists(guid) {
    return !!this.tableContainer.querySelector(`div[data-guid="${guid}"]`);
  },

  addEntry(guid, entryData = {}) {
    guid = guid || TabManager.getActiveTab() || TabManager.addNewTab("Default");
    const tableBody = document.getElementById(`entries-${guid}`);
    const entry = document.createElement('tr');
    entry.className = 'entry';
    entry.setAttribute('draggable', 'true');
    const usedColors = Array.from(document.querySelectorAll('.entry .bg-color-text')).map(input => input.value);
    const availableColors = boldColors.filter(color => !usedColors.includes(color));
    const bgColor = entryData.bgColor || (availableColors.length > 0 ? availableColors[0] : 'DodgerBlue');
    const bgColorHex = convertToHex(entryData.bgColor || bgColor);
    const textColor = suggestTextColor(bgColorHex);

    entry.innerHTML = `
      <td class="drag-handle"><i class="fas fa-bars"></i><input type="hidden" class="tab" value="${entryData.tab || ''}"></td>
      <td><input type="text" placeholder="Subdomain" class="subdomain" value="${entryData.subdomain || ''}"></td>
      <td><input type="text" placeholder="Label" class="label" value="${entryData.label || ''}"></td>
      <td>
        <div class="color-input">
          <input type="text" placeholder="Background Color" class="bg-color-text" value="${bgColor}">
          <input type="color" class="bg-color-picker" value="${convertToHex(bgColor)}">
        </div>
      </td>
      <td>
        <div class="color-input">
          <input type="text" placeholder="Text Color" class="text-color-text" value="${textColor}">
          <input type="color" class="text-color-picker" value="${convertToHex(textColor)}">
        </div>
      </td>
      <td><button class="remove-button"><i class="fas fa-trash-alt"></i></button></td>
    `;
    if (Object.keys(entryData).length === 0) {
      const unsavedRows = tableBody.querySelectorAll('.entry.unsaved');
      if (unsavedRows.length > 0) {
        tableBody.appendChild(entry);
      } else {
        tableBody.appendChild(entry);
      }
    } else {
      const unsavedRows = tableBody.querySelectorAll('.entry.unsaved');
      if (unsavedRows.length > 0) {
        tableBody.insertBefore(entry, unsavedRows[0]);
      } else {
        tableBody.appendChild(entry);
      }
    }

    const bgColorText = entry.querySelector('.bg-color-text');
    const bgColorPicker = entry.querySelector('.bg-color-picker');
    const textColorText = entry.querySelector('.text-color-text');
    const textColorPicker = entry.querySelector('.text-color-picker');
    const subdomainInput = entry.querySelector('.subdomain');
    const labelInput = entry.querySelector('.label');

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

    // Add focus event listeners to update the banner when an entry is being edited
    [bgColorText, bgColorPicker, textColorText, textColorPicker, subdomainInput, labelInput].forEach(input => {
      input.addEventListener('focus', () => {
        updateBanner();
      });
    });

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
        this.addEntry();
      }
    });

    function updateBanner() {
      createBanner(labelInput.value || 'Label', bgColorText.value || 'red', textColorText.value || 'white');
    }

    function capitalizeColor(color) {
      return color.toUpperCase();
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
      if (subdomainInput.value && bgColorText.value && textColorText.value && labelInput.value && !TableManager.isDuplicateSubdomain(subdomainInput.value)) {
        TableManager.saveEntries();
        entry.classList.remove('unsaved');
      } else {
        entry.classList.add('unsaved');
      }
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

    function isValidColor(color) {
      const s = new Option().style;
      s.color = color;
      return s.color !== '';
    }

    function capitalizeIfHash(input) {
      if (input.value.startsWith('#')) {
        input.value = input.value.toUpperCase();
      }
    }

    function convertToHex(color) {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = color;
      return ctx.fillStyle;
    }

    function suggestTextColor(bgColor) {
      const color = bgColor.replace('#', '');
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? 'Black' : 'White';
    }

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
    }

  },
};

const TabManager = {
  tabContainer: document.querySelector('.tab'),
  getActiveTab() {
    const activeTab = this.tabContainer.querySelector('.tablinks.active:not(#newTab)');
    return activeTab ? activeTab.getAttribute('data-guid') : null;
  },
  getTabOrder() {
    const tabs = Array.from(this.tabContainer.querySelectorAll('.tablinks:not(#newTab)'));
    return tabs.map(tab => {
      const input = tab.querySelector('.tab-input');
      return input ? input.value : null;
    }).filter(name => name !== null);
  },
  tabExists(tabName) {
    const tab = Array.from(this.tabContainer.children).find(tab => {
      const input = tab.querySelector('.tab-input');
      return input && input.value === tabName;
    });
    return tab ? tab.getAttribute('data-guid') : null;
  },
  getTabGUIDByName(tabName) {
    const tab = Array.from(this.tabContainer.querySelectorAll('.tablinks')).find(tab => {
      const input = tab.querySelector('.tab-input');
      return input && input.value === tabName;
    });
    return tab ? tab.getAttribute('data-guid') : null;
  },
  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  getTabNameByGUID(guid) {
    const tab = this.tabContainer.querySelector(`.tablinks[data-guid="${guid}"]`);
    const input = tab.querySelector('.tab-input');
    return input ? input.value : null;
  },

  movePlusTabToEnd() {
    const plusTab = this.tabContainer.querySelector('#newTab');
    if (plusTab && plusTab.textContent.includes('+')) {
      this.tabContainer.appendChild(plusTab);
    }
  },

  getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.tablinks[draggable="true"]:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  },

  addDragAndDrop(tab) {
    let draggingTab = null;
    let scrollInterval = null;

    tab.addEventListener('dragstart', (e) => {
      draggingTab = tab;
      tab.classList.add('dragging');
    });

    tab.addEventListener('dragend', () => {
      draggingTab = null;
      tab.classList.remove('dragging');
      clearInterval(scrollInterval);
      TableManager.saveEntries();
    });

    tab.addEventListener('dragover', (e) => {
      const draggingRow = document.querySelector('.entry.dragging');
      if (draggingRow) {
        const tableId = draggingRow.closest('table').id;
        const guid = tableId.replace('entries-table-', '');
        const tabGUID = tab.getAttribute('data-guid');
        if (tabGUID !== guid) {
          const tableBody = document.getElementById(`entries-${tabGUID}`);
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

    this.tabContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(this.tabContainer, e.clientX);
      if (draggingTab instanceof Node) {
        if (afterElement == null) {
          this.tabContainer.appendChild(draggingTab);
        } else {
          this.tabContainer.insertBefore(draggingTab, afterElement);
        }
        // Initial check to ensure the `+` tab is at the end
        this.movePlusTabToEnd();
      }

      // Auto-scroll when dragging near the edges
      const containerRect = this.tabContainer.getBoundingClientRect();
      if (e.clientX < containerRect.left + 50) {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
          this.tabContainer.scrollBy({ left: -100, behavior: 'smooth' });
        }, 100);
      } else if (e.clientX > containerRect.right - 50) {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
          this.tabContainer.scrollBy({ left: 100, behavior: 'smooth' });
        }, 100);
      } else {
        clearInterval(scrollInterval);
      }
    });

    this.tabContainer.addEventListener('drop', () => {
      clearInterval(scrollInterval);
    });
  },

  addNewTab(newTabName = 'New') {
    const plusTabButton = this.tabContainer.querySelector('#newTab');
    let counter = 1;

    // Check for existing tab names and increment the counter until a unique name is found
    while (Array.from(this.tabContainer.children).some(tab => tab.querySelector('.tab-input') && tab.querySelector('.tab-input').value === newTabName)) {
      newTabName = `New ${counter}`;
      counter++;
    }

    // Remove "active" class from the currently active tab
    const currentActiveTab = document.querySelector('.tablinks.active');
    if (currentActiveTab) {
      currentActiveTab.classList.remove('active');
    }

    // Generate a GUID for the new tab
    const tabGUID = this.generateGUID();

    // Create the new tab button
    const newTabButton = document.createElement('button');
    newTabButton.textContent = newTabName;
    newTabButton.className = 'tablinks active'; // Add both 'tablinks' and 'active' classes
    newTabButton.setAttribute('draggable', 'true');
    newTabButton.setAttribute('data-guid', tabGUID); // Set the GUID as a data attribute
    newTabButton.innerHTML = `<i class="fas fa-grip-lines-vertical"></i> <input type="text" class="tab-input" value="${newTabName}">`;

    // Insert the new tab button before the "+" tab button
    this.tabContainer.insertBefore(newTabButton, plusTabButton);

    // Scroll to the new tab
    plusTabButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

    // Add drag-and-drop functionality to the new tab
    this.addDragAndDrop(newTabButton);
    TableManager.addNewTable(tabGUID);

    // Define tabInputs
    const tabInput = newTabButton.querySelectorAll('.tab-input');

    // Add input event listeners to tabInputs
    tabInput.forEach(input => {
      const tabInputs = document.querySelectorAll('.tab-input');

      input.addEventListener('input', (e) => {
        const currentValue = e.target.value;
        setTimeout(() => { }, 0);
        let isDuplicate = false;
        tabInputs.forEach(otherInput => {
          if (otherInput !== e.target && otherInput.value.trim().toLowerCase() === currentValue.trim().toLowerCase()) {
            isDuplicate = true;
          }
        });
        if (isDuplicate) {
          e.target.classList.add('invalid');
          if (!e.target.nextElementSibling || !e.target.nextElementSibling.classList.contains('invalidIcon')) {
            const invalidIcon = document.createElement('i');
            invalidIcon.className = 'fas fa-question-circle invalidIcon';
            e.target.parentNode.appendChild(invalidIcon);
          }
        } else {
          e.target.classList.remove('invalid');
          const existingIcon = e.target.parentNode.querySelector('.invalidIcon');
          if (existingIcon) {
            existingIcon.remove();
          }
          TableManager.saveEntries();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault(); // Prevent default behavior
          e.stopPropagation(); // Stop event propagation

          // Add a space to the input value
          const cursorPosition = input.selectionStart; // Current cursor position
          const currentValue = input.value;
          input.value = currentValue.slice(0, cursorPosition) + ' ' + currentValue.slice(cursorPosition);

          // Set the cursor position after the inserted space
          input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        }
      });
    });

    newTabButton.addEventListener('click', (event) => {
      // Add event listener to input fields to check for duplicate values
      const tabInputs = document.querySelectorAll('.tab-input');

      // Remove "active" class from all tabs
      const allTabs = this.tabContainer.querySelectorAll('.tablinks');
      allTabs.forEach(tab => tab.classList.remove('active'));

      // Add "active" class to the clicked tab
      newTabButton.classList.add('active');
      const tabGUID = newTabButton.getAttribute('data-guid');

      // Show the corresponding table and hide others
      const allTables = document.querySelectorAll('table[id^="entries-table-"]');
      allTables.forEach(table => {
        const isCurrentTable = table.id === `entries-table-${tabGUID}`;
        table.style.display = isCurrentTable ? 'block' : 'none';
        if (isCurrentTable && event.target.tagName.toLowerCase() !== 'input') {
          // Set focus to the subdomain field of the last row in the table
          const lastRow = table.querySelector('tbody tr:last-child .subdomain');
          if (lastRow) {
            lastRow.focus();
          }
        }
      });
    });
    return tabGUID
  }
};


/**
 * Handles the drag-and-drop functionality for tabs within the tab container.
 */
document.addEventListener('DOMContentLoaded', function () {
  // Select the add entry button
  const addEntryButton = document.getElementById('addEntryButton');

  // Select the tab container and scroll buttons
  const tabContainer = document.querySelector('.tab');
  const scrollLeftButton = document.querySelector('.scroll-button.left');
  const scrollRightButton = document.querySelector('.scroll-button.right');

  // Scroll the tab container to the left
  scrollLeftButton.addEventListener('click', () => {
    tabContainer.scrollBy({ left: -150, behavior: 'smooth' });
  });

  // Scroll the tab container to the right
  scrollRightButton.addEventListener('click', () => {
    tabContainer.scrollBy({ left: 150, behavior: 'smooth' });
  });

  // Scroll the tab container to the left
  let scrollLeftInterval;
  scrollLeftButton.addEventListener('mousedown', () => {
    scrollLeftInterval = setInterval(() => {
      tabContainer.scrollBy({ left: -100, behavior: 'smooth' });
    }, 100);
  });
  scrollLeftButton.addEventListener('mouseup', () => {
    clearInterval(scrollLeftInterval);
  });
  scrollLeftButton.addEventListener('mouseleave', () => {
    clearInterval(scrollLeftInterval);
  });

  // Scroll the tab container to the right
  let scrollRightInterval;
  scrollRightButton.addEventListener('mousedown', () => {
    scrollRightInterval = setInterval(() => {
      tabContainer.scrollBy({ left: 100, behavior: 'smooth' });
    }, 100);
  });
  scrollRightButton.addEventListener('mouseup', () => {
    clearInterval(scrollRightInterval);
  });
  scrollRightButton.addEventListener('mouseleave', () => {
    clearInterval(scrollRightInterval);
  });

  // Add event listener for the "+" tab button
  const plusTabButton = tabContainer.querySelector('#newTab');
  plusTabButton.addEventListener('click', () => {
    TabManager.addNewTab();
    TableManager.addEntry();
  });

  // Add drag-and-drop functionality to existing tabs
  const tabs = tabContainer.querySelectorAll('.tablinks[draggable="true"]');
  tabs.forEach(tab => TabManager.addDragAndDrop(tab));

  const optionsButton = document.getElementById('optionsButton');
  const optionsMenu = document.getElementById('optionsMenu');
  const useTabGroupsToggle = document.getElementById('useTabGroupsToggle');
  const tabGroupsOption = document.getElementById('tabGroupsOption');

  // Load the current value from Chrome storage and set the toggle state
  chrome.storage.local.get('useTabGroups', (result) => {
    useTabGroupsToggle.checked = result.useTabGroups || false;
  });

  // Update Chrome storage when the toggle is changed
  useTabGroupsToggle.addEventListener('change', () => {
    chrome.storage.local.set({ useTabGroups: useTabGroupsToggle.checked });
  });

  // Toggle the useTabGroupsToggle input value when tabGroupsOption button is clicked
  tabGroupsOption.addEventListener('click', () => {
    useTabGroupsToggle.checked = !useTabGroupsToggle.checked;
    chrome.storage.local.set({ useTabGroups: useTabGroupsToggle.checked });
  });

  optionsButton.addEventListener('click', () => {
    optionsMenu.classList.toggle('hidden');

    // Get the position of the optionsButton
    const buttonRect = optionsButton.getBoundingClientRect();

    // Set the position of the optionsMenu
    optionsMenu.style.top = `${buttonRect.bottom}px`;
    optionsMenu.style.left = `${buttonRect.left}px`;
  });

  document.addEventListener('click', (event) => {
    if (!optionsButton.contains(event.target) && !optionsMenu.contains(event.target)) {
      optionsMenu.classList.add('hidden');
    }
  });

  const importOption = document.getElementById('importOption');
  const exportOption = document.getElementById('exportOption');

  importOption.addEventListener('click', () => {
    optionsMenu.classList.add('hidden');
    // Add your import functionality here
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const entries = JSON.parse(e.target.result);
            if (Array.isArray(entries)) {
              const existingEntries = {};
              document.querySelectorAll('.entry .subdomain').forEach(input => {
                existingEntries[input.value.trim().toLowerCase()] = input.closest('.entry');
              });

              entries.forEach(entry => {
                let invalidEntriesCount = 0;

                if (entry.bgColor && entry.label && entry.subdomain && entry.textColor) {
                  const subdomainKey = entry.subdomain.trim().toLowerCase();
                  let tabGUID = TabManager.getTabGUIDByName(entry.tabname || 'Default');
                  if (!tabGUID) {
                    tabGUID = TabManager.addNewTab(entry.tabname || 'Default');
                  }

                  if (existingEntries[subdomainKey]) {
                    const existingEntry = existingEntries[subdomainKey];
                    existingEntry.querySelector('.label').value = entry.label;
                    existingEntry.querySelector('.bg-color-text').value = entry.bgColor;
                    existingEntry.querySelector('.text-color-text').value = entry.textColor;
                  } else {
                    TableManager.addEntry(tabGUID, entry);
                  }
                } else {
                  invalidEntriesCount++;
                }

                if (invalidEntriesCount > 0) {
                  alert(`${invalidEntriesCount} entries were in an invalid format and were not imported.`);
                }
              });
              TableManager.saveEntries();
            } else {
              alert('Invalid JSON format: Expected an array of entries.');
            }
          } catch (error) {
            alert('Error parsing JSON: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    });
    fileInput.click();
  });

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

  // Load entries from storage
  chrome.storage.local.get('entries', (result) => {
    if (result.entries && result.entries.length > 0) {
      let previousTabName = null;
      result.entries.forEach(entryData => {
        if (!entryData.tabname) {
          entryData.tabname = "Default";
        }

        if (previousTabName !== null && previousTabName !== entryData.tabname) {
          TableManager.addEntry();
        }

        let tabGUID = TabManager.getTabGUIDByName(entryData.tabname);
        if (!tabGUID) {
          tabGUID = TabManager.addNewTab(entryData.tabname);
        }

        TableManager.addEntry(tabGUID, entryData);

        previousTabName = entryData.tabname;
      });
      TableManager.addEntry(); // Add a blank entry if no entries are found
    } else {
      TableManager.addEntry(); // Add a blank entry if no entries are found
    }

    // Activate the first tab and its corresponding table
    const firstTab = tabContainer.querySelector('.tablinks:not(#newTab)');
    if (firstTab) {
      firstTab.click();
    }
  });

  if (addEntryButton) {
    addEntryButton.addEventListener('click', () => {
      TableManager.addEntry();
    });
  }
});