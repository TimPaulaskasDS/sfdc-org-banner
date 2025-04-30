/**
 * Salesforce Org Banner Extension
 * 
 * This extension adds color-coded banners to Salesforce orgs for easy identification.
 * It handles both traditional Salesforce UI and the new DevOps Center header.
 */

/**
 * CONFIGURATION AND CONSTANTS
 */
// Salesforce domains as of 2025-01-03
// Reference: https://help.salesforce.com/articleView?id=000321501&type=1&mode=1
const SFDC_DOMAINS = [
  'bluetail.salesforce.com',
  'force.com',
  'forceusercontent.com',
  'force-user-content.com',
  'salesforce.com',
  'salesforceliveagent.com',
  'salesforce-experience.com',
  'salesforce-hub.com',
  'salesforce-scrt.com',
  'salesforce-setup.com',
  'salesforce-sites.com',
  'sfdcopens.com',
  'site.com',
  'trailhead.com',
  'documentforce.com',
  'lightning.com',
  'salesforce-communities.com',
  'sfdc.sh',
  'visualforce.com',
].map(domain => domain.toLowerCase()); // Convert domains to lowercase for case-insensitive matching

// CSS selectors used throughout the code
const CSS_SELECTORS = {
  devopsHeader: 'devops_center-base-component',
  devopsOrgInfo: 'devops_center-org-info',
  devopsSandboxName: '.sandbox-name',
  devopsNavBarContainer: 'devops_center-base-component .navBar-container',
  devopsTextElements: '.slds-text-title, .slds-text-color_on-surface-1, .slds-text-color_on-surface-2, .sandbox-name',
  dismissButton: '.sfdc-org-banner-dismiss',
  dropdownStylesClass: 'sfdc-org-banner-dropdown-styles',
  traditionalBanner: '.slds-notify_alert.slds-notify--alert.oneSystemMessage.banner',
  loginAsBanner: ".slds-notify_alert.system-message.level-info.slds-theme_info[data-message-id='loginAsSystemMessage']",
  sfdcBanner: '.slds-color__background_gray-1.slds-text-align_center.slds-size_full.slds-text-body_regular.oneSystemMessage',
  globalHeader: '.slds-global-header.slds-grid.slds-grid_align-spread',
  oneSystemMessage: '.oneSystemMessage',
  favicon: 'link[rel="icon"]'
};

// Mutation observer timeout duration
const MUTATION_TIMEOUT_DURATION = 1500;

/**
 * URL AND DOMAIN UTILITY FUNCTIONS
 */
const URLUtils = {
  /**
   * Extract the first subdomain from a URL
   * @param {string} url - The URL to extract from
   * @returns {string|null} The first subdomain or null if not found
   */
  getFirstSubdomain(url) {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      return parts.length > 2 ? parts[0] : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if a domain is in the list of Salesforce domains
   * @param {string} url - The URL to check
   * @returns {boolean} True if the domain is in the list
   */
  isDomainInList(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return SFDC_DOMAINS.includes(hostname);
    } catch (error) {
      return false;
    }
  },

  /**
   * Check if the given URL is for login.salesforce.com
   * @param {string} url - The URL to check
   * @returns {boolean} True if the URL is for login.salesforce.com
   */
  isLoginSalesforce(url) {
    return new URL(url).hostname === 'login.salesforce.com';
  }
};

/**
 * COLOR UTILITY FUNCTIONS
 */
const ColorUtils = {
  /**
   * Convert any color format to hex
   * @param {string} color - The color to convert
   * @returns {string} The hex representation of the color
   */
  convertToHex(color) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    return ctx.fillStyle;
  },

  /**
   * Calculate a darker version of the given color
   * @param {string} bgColor - The background color
   * @param {number} [darkenFactor=0.2] - How much to darken the color
   * @returns {string} The darkened color in RGB format
   */
  getDarkGradientColor(bgColor, darkenFactor = 0.2) {
    const hex = bgColor.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
    
    const darkR = Math.max(0, Math.floor(r * (1 - darkenFactor)));
    const darkG = Math.max(0, Math.floor(g * (1 - darkenFactor)));
    const darkB = Math.max(0, Math.floor(b * (1 - darkenFactor)));

    return `rgb(${darkR}, ${darkG}, ${darkB})`;
  },

  /**
   * Calculate a lighter version of the given color
   * @param {string} bgColor - The background color
   * @param {number} [lightenFactor=0.3] - How much to lighten the color
   * @returns {string} The lightened color in RGB format
   */
  getLightGradientColor(bgColor, lightenFactor = 0.3) {
    const hex = bgColor.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
    
    const lightR = Math.min(255, Math.floor(r * (1 + lightenFactor)));
    const lightG = Math.min(255, Math.floor(g * (1 + lightenFactor)));
    const lightB = Math.min(255, Math.floor(b * (1 + lightenFactor)));

    return `rgb(${lightR}, ${lightG}, ${lightB})`;
  },

  /**
   * Suggest text color (black or white) based on background color
   * @param {string} bgColor - The background color
   * @returns {string} '#000000' for black or '#FFFFFF' for white
   */
  suggestTextColor(bgColor) {
    const hex = this.convertToHex(bgColor).replace('#', '');
    
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? '#000000' : '#FFFFFF';
  },

  /**
   * Change the favicon color
   * @param {string} color - The color to apply to the favicon
   */
  changeFaviconColor(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    const context = canvas.getContext('2d');
    const img = new Image();
    const oldLink = document.querySelector(CSS_SELECTORS.favicon);
    img.src = oldLink ? oldLink.href : '/favicon.ico'; // Fallback to default favicon if not found

    img.onload = () => {
      context.drawImage(img, 0, 0, 16, 16);
      context.globalCompositeOperation = 'source-atop';
      context.fillStyle = color;
      context.fillRect(0, 0, 16, 16);

      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = canvas.toDataURL('image/png');

      if (oldLink) {
        document.head.removeChild(oldLink);
      }
      document.head.appendChild(link);
    };
  }
};

/**
 * DEVOPS CENTER HEADER MANAGEMENT
 */
const DevOpsCenterHeader = {
  /**
   * Check if the DevOps Center header exists in the page
   * @returns {boolean} True if the DevOps Center header exists
   */
  exists() {
    return document.querySelector(CSS_SELECTORS.devopsHeader) !== null;
  },

  /**
   * Get the sandbox name from the DevOps Center header
   * @returns {string|null} The sandbox name or null if not found
   */
  getSandboxName() {
    const orgInfoElement = document.querySelector(CSS_SELECTORS.devopsOrgInfo);
    if (orgInfoElement) {
      const sandboxNameElement = orgInfoElement.querySelector(CSS_SELECTORS.devopsSandboxName);
      return sandboxNameElement ? sandboxNameElement.textContent.trim() : null;
    }
    return null;
  },

  /**
   * Style the DevOps Center header with the specified colors
   * @param {string} bgColor - Background color
   * @param {string} textColor - Text color
   * @param {string} label - Text label to display in the header
   * @returns {boolean} True if the header was styled successfully
   */
  styleHeader(bgColor, textColor, label) {
    const headerContainer = document.querySelector(CSS_SELECTORS.devopsNavBarContainer);
    if (!headerContainer) return false;

    // Store original background to restore if banner is dismissed
    if (!headerContainer.dataset.originalBg) {
      headerContainer.dataset.originalBg = headerContainer.style.backgroundColor || '';
    }

    // Apply new styles
    Object.assign(headerContainer.style, {
      backgroundColor: bgColor,
      backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent)',
      backgroundSize: '64px 64px',
      position: 'relative', // Ensure we can position the label absolutely within the header
    });

    // Style the text elements
    const textElements = headerContainer.querySelectorAll(CSS_SELECTORS.devopsTextElements);
    for (const el of textElements) {
      el.style.color = textColor;
    }

    // Remove any existing label
    const existingLabel = headerContainer.querySelector('.sfdc-org-banner-label');
    if (existingLabel) {
      existingLabel.remove();
    }

    // Create new label element - positioned absolutely and centered
    const labelElement = document.createElement('div');
    labelElement.className = 'sfdc-org-banner-label';
    labelElement.textContent = label;
    Object.assign(labelElement.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: '0',
      bottom: '0',
      margin: 'auto',
      color: textColor,
      fontWeight: 'bold',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      pointerEvents: 'none', // Ensure it doesn't interfere with clicking elements behind it
      zIndex: '1',           // Place above the background but below interactive elements
    });

    // Append the label to the header container
    headerContainer.appendChild(labelElement);

    // Calculate colors for dropdown button styling
    const bgColorHex = ColorUtils.convertToHex(bgColor);
    const darkGradientColor = ColorUtils.getDarkGradientColor(bgColorHex);
    const lightGradientColor = ColorUtils.getLightGradientColor(bgColorHex);
    const arrowColor = ColorUtils.suggestTextColor(darkGradientColor);

    // Create a style element specifically for the dropdown button in both normal and hover states
    const styleElement = document.createElement('style');
    styleElement.className = CSS_SELECTORS.dropdownStylesClass;
    styleElement.textContent = `
      /* Style for the dropdown button in normal state */
      .navBar-container lightning-button-menu .slds-button_icon-border,
      .navBar-container lightning-button-menu button.slds-button_icon-border {
        background-color: ${darkGradientColor} !important;
        border-color: ${lightGradientColor} !important;
      }
      
      /* Make the SVG icon visible in normal state */
      .navBar-container lightning-button-menu button svg[data-key="down"] {
        fill: ${arrowColor} !important;
      }
      
      /* Style for the dropdown button in hover state */
      .navBar-container lightning-button-menu .slds-button_icon-border:hover,
      .navBar-container lightning-button-menu button.slds-button_icon-border:hover {
        background-color: ${darkGradientColor} !important;
        border-color: ${lightGradientColor} !important;
        filter: brightness(1.2) !important;
      }
      
      /* Make the SVG icon visible in hover state */
      .navBar-container lightning-button-menu button:hover svg[data-key="down"] {
        fill: ${arrowColor} !important;
      }
      
      /* Style for the dropdown button in focus state */
      .navBar-container lightning-button-menu .slds-button_icon-border:focus,
      .navBar-container lightning-button-menu button.slds-button_icon-border:focus {
        box-shadow: 0 0 3px ${lightGradientColor} !important;
      }
      
      /* Make the SVG icon visible in focus state */
      .navBar-container lightning-button-menu button:focus svg[data-key="down"] {
        fill: ${arrowColor} !important;
      }
      
      /* Style for the org banner label */
      .sfdc-org-banner-label {
        font-size: 16px !important;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
    `;

    // Remove any existing style element
    const existingStyle = document.querySelector(`.${CSS_SELECTORS.dropdownStylesClass}`);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Append the style element to the head
    document.head.appendChild(styleElement);

    return true;
  }
};

/**
 * TRADITIONAL BANNER MANAGEMENT
 */
const TraditionalBanner = {
  /**
   * Apply styles to a banner element
   * @param {HTMLElement} banner - The banner element
   * @param {string} textColor - The text color
   * @param {string} bgColor - The background color
   */
  applyStyles(banner, textColor, bgColor) {
    const isLoginSalesforce = URLUtils.isLoginSalesforce(window.location.href);

    Object.assign(banner.style, {
      position: isLoginSalesforce ? 'absolute' : 'relative',
      display: 'block',
      width: '100%',
      padding: '0.5rem 2rem',
      color: textColor,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: bgColor,
      backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent)',
      backgroundSize: '64px 64px',
      boxSizing: 'border-box',
    });
  },

  /**
   * Create or update a banner with the specified text and colors
   * @param {string} text - The banner text
   * @param {string} bgColor - Background color
   * @param {string} textColor - Text color
   */
  create(text, bgColor = 'red', textColor = 'white') {
    // Check for existing login as banner
    const existingBanner = document.querySelector(CSS_SELECTORS.loginAsBanner);
    if (existingBanner) {
      // Verify this is actually a "Logged in as" banner by checking for specific text
      const bannerContent = existingBanner.textContent || '';
      if (bannerContent.includes('Logged in as') && bannerContent.includes('Log out as')) {
        // Apply the styles to the existing banner
        this.applyStyles(existingBanner, textColor, bgColor);
        
        // Add our label to the left side of the banner
        const firstChild = existingBanner.firstChild;
        const labelElement = document.createElement('span');
        labelElement.className = 'sfdc-org-banner-label';
        labelElement.textContent = `[ ${text} ] `;
        Object.assign(labelElement.style, {
          fontWeight: 'bold',
          marginRight: '5px',
        });
        
        // Insert our label at the beginning of the banner
        existingBanner.insertBefore(labelElement, firstChild);
        
        // Apply text color to any hyperlinks within the banner
        const links = existingBanner.querySelectorAll('a');
        for (const link of links) {
          link.style.color = textColor;
        }
        return;
      }
      // If not a proper "Logged in as" banner, continue to other banner types
    }

    // Locate the "Logged in as" bar
    const sfdcBanner = document.querySelector(CSS_SELECTORS.sfdcBanner);
    // Locate the global header
    const globalHeader = document.querySelector(CSS_SELECTORS.globalHeader);

    // Handle system message banner
    if (sfdcBanner) {
      setTimeout(() => {
        const oneSystemMessage = document.querySelector(CSS_SELECTORS.oneSystemMessage);
        const bannerBar = oneSystemMessage?.firstElementChild;

        if (bannerBar) {
          // Apply the styles to the existing banner
          this.applyStyles(bannerBar, textColor, bgColor);
          // Apply text color to any hyperlinks within the banner
          const links = bannerBar.querySelectorAll('a');
          for (const link of links) {
            link.style.color = textColor;
          }
        } else {
          // Create a new banner element
          const banner = document.createElement('div');
          banner.className = 'slds-notify_alert slds-notify--alert oneSystemMessage banner';
          this.applyStyles(banner, textColor, bgColor);
          banner.textContent = text;
          sfdcBanner.parentNode.insertBefore(banner, sfdcBanner);
          this.addDismissButton(banner, textColor);
        }
      }, 1000); // Wait 1 second to ensure the DOM is ready
    } else {
      // Create a new banner element
      const banner = document.createElement('div');
      banner.className = 'slds-notify_alert slds-notify--alert oneSystemMessage banner';
      this.applyStyles(banner, textColor, bgColor);
      banner.textContent = text;

      if (globalHeader) {
        // Add the banner before the global header
        globalHeader.parentNode.insertBefore(banner, globalHeader);
      } else {
        // Insert the banner immediately after the <body> tag
        document.body.insertAdjacentElement('afterbegin', banner);
        banner.style.zIndex = '1000'; // Set z-index only if sfdcBanner and globalHeader are not found
      }

      // Check banner position and adjust if needed
      const rect = banner.getBoundingClientRect();
      if (rect.top > 100) {
        banner.style.position = 'absolute';
      }

      this.addDismissButton(banner, textColor);
    }
  },

  /**
   * Add a dismiss button to the banner
   * @param {HTMLElement} banner - The banner element
   * @param {string} textColor - The text color for the button
   */
  addDismissButton(banner, textColor = 'white') {
    // Create the dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.textContent = '✕';
    Object.assign(dismissButton.style, {
      position: 'absolute',
      top: '0.25rem',
      right: '1rem',
      backgroundColor: 'transparent',
      background: 'none !important',
      border: 'none',
      color: textColor,
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
    });

    // Ensure no background image is applied
    dismissButton.style.setProperty('background', 'none', 'important');
    dismissButton.style.setProperty('background-color', 'transparent', 'important');

    // Add click event to hide the banner
    dismissButton.addEventListener('click', () => {
      banner.style.display = 'none';
    });

    // Append the dismiss button to the banner
    banner.appendChild(dismissButton);
  }
};

/**
 * MAIN APPLICATION LOGIC
 */
const OrgBanner = {
  mutationTimeout: null,

  /**
   * Initialize the banner application
   */
  init() {
    // Set up mutation observer to watch for DOM changes
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // Locate the "Logged in as" bar
          const sfdcBanner = document.querySelector(CSS_SELECTORS.sfdcBanner);
          // Locate the global header
          const globalHeader = document.querySelector(CSS_SELECTORS.globalHeader);

          // Clear the previous timeout if there is one
          clearTimeout(this.mutationTimeout);

          // Set a new timeout to check if mutations have stopped
          this.mutationTimeout = setTimeout(() => {
            this.processBanner();
            observer.disconnect(); // Stop observing once the elements are found
          }, MUTATION_TIMEOUT_DURATION);

          if (sfdcBanner || globalHeader) {
            observer.disconnect(); // Stop observing once the elements are found
            break;
          }
        }
      }
    });

    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true });
  },

  /**
   * Process the current page and apply banner if needed
   */
  processBanner() {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const hostname = url.hostname.toLowerCase();

    // Load entries from storage
    chrome.storage.local.get('entries', (result) => {
      if (!result.entries) return;

      for (const entry of result.entries) {
        const subdomain = entry.subdomain;

        // Split the hostname into parts
        const urlParts = hostname.split('.');
        const currentSubdomain = urlParts[0];

        // Check if the current hostname starts with the subdomain
        if (currentSubdomain === subdomain.toLowerCase()) {
          // Extract the remaining domain part
          const remainingDomain = `.${urlParts.slice(1).join('.')}`;

          // Check if the remaining domain ends with any of the domains or sandbox.domain
          const matchedDomain = SFDC_DOMAINS.find(
            (domain) => remainingDomain.endsWith(`.${domain}`) || remainingDomain.endsWith(`.sandbox.${domain}`)
          );

          if (matchedDomain) {
            console.log(
              `Salesforce Org Banner:\nFound matching subdomain: [${currentSubdomain}]\nFound matching domain: [${matchedDomain}]`
            );

            // Apply the banner based on UI type
            this.applyBanner(entry);
          }
        }
      }
    });
  },

  /**
   * Apply the appropriate banner type based on the UI
   * @param {Object} entry - The entry with label, bgColor, and textColor
   */
  applyBanner(entry) {
    // Remove any existing traditional banner
    const existingBanner = document.querySelector(CSS_SELECTORS.traditionalBanner);
    if (existingBanner) {
      existingBanner.remove();
    }

    // Apply banner based on UI type
    if (DevOpsCenterHeader.exists()) {
      console.log('Salesforce Org Banner: Using devops center header');
      DevOpsCenterHeader.styleHeader(entry.bgColor, entry.textColor, entry.label);
    } else {
      TraditionalBanner.create(entry.label, entry.bgColor, entry.textColor);
    }

    // Change favicon color regardless of which method was used
    ColorUtils.changeFaviconColor(entry.bgColor);
  }
};

// Initialize the application
OrgBanner.init();
