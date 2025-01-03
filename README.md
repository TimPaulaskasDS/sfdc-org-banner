# SFDC Org Banner

## Overview

SFDC Org Banner is a Google Chrome extension designed to enhance the user experience for Salesforce users by displaying a banner at the top of the Salesforce page.

## Features

- Background script to manage the extension's lifecycle and handle events.
- Content script that interacts with Salesforce web pages to manipulate the DOM.
- Popup interface for user interactions, providing easy access to functionalities.

## Project Structure

```
sfdc-org-banner
├── src
│   ├── background.js          # Background script for managing events
│   ├── content.js             # Content script for DOM manipulation
│   ├── popup
│   │   ├── popup.html         # HTML structure for the popup
│   │   ├── popup.js           # JavaScript logic for the popup
│   │   └── popup.css          # Styles for the popup
│   ├── options
│   │   ├── options.html       # HTML structure for the options page
│   │   ├── options.js         # JavaScript logic for the options page
│   │   └── options.css        # Styles for the options page
│   ├── manifest.json          # Configuration file for the Chrome extension
│   └── assets
│       ├── icon-16.png        # Icon for the Chrome extension (16x16)
│       ├── icon-32.png        # Icon for the Chrome extension (32x32)
│       ├── icon-48.png        # Icon for the Chrome extension (48x48)
│       ├── icon-128.png       # Icon for the Chrome extension (128x128)
│       └── icon-256.png       # Icon for the Chrome extension (256x256)
├── .eslintrc.json             # ESLint configuration
├── .gitignore                  # Git ignore file
├── .prettierrc                 # Prettier configuration
├── babel.config.cjs            # Babel configuration
├── package.json                # npm configuration
├── README.md                   # Project documentation
└── vitest.config.js            # Vitest configuration
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/TimPaulaskasDS/sfdc-org-banner
   ```
2. Navigate to the project directory:
   ```
   cd sfdc-org-banner
   ```
3. Install dependencies using pnpm:
   ```
   pnpm install
   ```

## Usage

1. Load the unpacked extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `src` directory.
2. Click the extension icon in the toolbar to open the popup.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
