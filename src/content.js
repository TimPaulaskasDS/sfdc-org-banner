/*
 Salesforce domains as of 2025-01-03
 Reference: https://help.salesforce.com/articleView?id=000321501&type=1&mode=1
 */
const domains = [
    "bluetail.salesforce.com",
    "force.com",
    "forceusercontent.com",
    "force-user-content.com",
    "salesforce.com",
    "salesforceliveagent.com",
    "salesforce-experience.com",
    "salesforce-hub.com",
    "salesforce-scrt.com",
    "salesforce-setup.com",
    "salesforce-sites.com",
    "sfdcopens.com",
    "site.com",
    "trailhead.com",
    "documentforce.com",
    "lightning.com",
    "salesforce-communities.com",
    "sfdc.sh",
    "visualforce.com"
];

// Convert domains to lowercase for case-insensitive matching
const lowerCaseDomains = domains.map(domain => domain.toLowerCase());

// Function to get the first subdomain
const getFirstSubdomain = (url) => {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    return parts.length > 2 ? parts[0] : null;
};

// Wait for the entire page to be fully loaded
window.onload = () => {
    const currentUrl = window.location.href;

    // Get the current URL
    const url = new URL(currentUrl);
    const hostname = url.hostname.toLowerCase();

    // Load entries from storage
    chrome.storage.local.get('entries', (result) => {
        if (result.entries) {
            result.entries.forEach(entry => {
                const subdomain = entry.subdomain;

                // Split the hostname into parts
                const urlParts = hostname.split('.');
                const currentSubdomain = urlParts[0];

                // Check if the current hostname starts with the subdomain
                if (currentSubdomain === subdomain) {
                    // Extract the remaining domain part
                    const remainingDomain = `.${urlParts.slice(1).join('.')}`;

                    // Check if the remaining domain ends with any of the domains or sandbox.domain
                    const matchedDomain = lowerCaseDomains.find(domain =>
                        remainingDomain.endsWith(`.${domain}`) || remainingDomain.endsWith(`.sandbox.${domain}`)
                    );

                    if (matchedDomain) {
                        console.log(`Salesforce Org Banner:`);
                        console.log(`Found matching subdomain: [${currentSubdomain}]`);
                        console.log(`Found matching domain: [${matchedDomain}]`);

                        setTimeout(() => {
                            createBanner(entry.label, entry.bgColor, entry.textColor);
                        }, 1000);
                    }
                }
            });
        }
    });
};

function createBanner(text, bgColor = 'red', textColor = 'white') {
    // Determine the gradient color based on the background color
    const gradientColor = getContrastColor(bgColor);

    // Define the banner styles
    const bannerStyles = {
        position: "relative", // Ensure the close button is positioned correctly
        display: "block", // Makes it span the full width
        width: "100%", // Full-width banner
        padding: "0.5rem 2rem", // Padding for spacing
        color: "white", // Text color
        fontWeight: "bold", // Bold text
        textAlign: "center", // Center text alignment
        backgroundColor: bgColor, // Background color
        backgroundImage: `linear-gradient(45deg, ${gradientColor} 25%, transparent 25%, transparent 50%, ${gradientColor} 50%, ${gradientColor} 75%, transparent 75%, transparent)`,
        backgroundSize: "64px 64px", // Matches Salesforce's style
        boxSizing: "border-box", // Include padding in width calculations
    };

    // Locate the existing banner
    const existingBanner = document.querySelector(
        ".slds-notify_alert.system-message.level-info.slds-theme_info[data-message-id='loginAsSystemMessage']"
    );

    if (existingBanner) {
        // Apply the styles to the existing banner
        Object.assign(existingBanner.style, bannerStyles);
    } else {
        // Create a new banner element
        const banner = document.createElement("div");
        banner.className = "slds-notify_alert slds-notify--alert oneSystemMessage banner";

        // Apply the styles to the new banner
        Object.assign(banner.style, bannerStyles);

        // Add content to the banner
        banner.textContent = text;

        // Locate the "Logged in as" bar
        const loggedInAsBar = document.querySelector(
            ".slds-color__background_gray-1.slds-text-align_center.slds-size_full.slds-text-body_regular.oneSystemMessage"
        );

        // Locate the global header
        const globalHeader = document.querySelector(
            ".slds-global-header.slds-grid.slds-grid_align-spread"
        );

        if (loggedInAsBar) {
            // Add the banner before the "Logged in as" bar
            loggedInAsBar.parentNode.insertBefore(banner, loggedInAsBar);
        } else if (globalHeader) {
            // Add the banner before the global header
            globalHeader.parentNode.insertBefore(banner, globalHeader);
        } else {
            // Insert the banner immediately after the <body> tag
            document.body.insertAdjacentElement("afterbegin", banner);
            banner.style.zIndex = "1000"; // Set z-index only if loggedInAsBar and globalHeader are not found
        }
    }

    // Ensure the banner element is selected correctly
    const bannerElement = document.querySelector(".slds-notify_alert.oneSystemMessage.banner");

    if (bannerElement) {
        // Create the dismiss button
        const dismissButton = document.createElement("button");
        dismissButton.textContent = "✕";
        Object.assign(dismissButton.style, {
            position: "absolute",
            top: "0.25rem",
            right: "1rem",
            backgroundColor: "transparent",
            background: "none !important",
            border: "none",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
        });
        // Ensure no background image is applied
        dismissButton.style.setProperty('background', 'none', 'important');
        dismissButton.style.setProperty('background-color', 'transparent', 'important');

        // Add click event to hide the banner
        dismissButton.addEventListener("click", () => {
            bannerElement.style.display = "none";
        });

        // Append the dismiss button to the banner
        bannerElement.appendChild(dismissButton);
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