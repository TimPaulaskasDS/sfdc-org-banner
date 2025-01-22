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
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');
        return parts.length > 2 ? parts[0] : null;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
};

// Function to check if a domain is in the list
const isDomainInList = (url) => {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return lowerCaseDomains.includes(hostname);
    } catch (error) {
        console.error('Invalid URL:', url);
        return false;
    }
};

const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Locate the "Logged in as" bar
            const sfdcBanner = document.querySelector(
                ".slds-color__background_gray-1.slds-text-align_center.slds-size_full.slds-text-body_regular.oneSystemMessage"
            );

            // Locate the global header
            const globalHeader = document.querySelector(
                ".slds-global-header.slds-grid.slds-grid_align-spread"
            );

            // Clear the previous timeout if there is one
            clearTimeout(mutationTimeout);

            // Set a new timeout to check if mutations have stopped
            mutationTimeout = setTimeout(() => {
                initializeBanner();
                observer.disconnect(); // Stop observing once the elements are found
            }, 1500); // Adjust the timeout duration as needed

            if (sfdcBanner || globalHeader) {
                observer.disconnect(); // Stop observing once the elements are found
                break;
            }
        }
    }
});

// Assuming you want to observe the body for changes
const targetNode = document.body;
const config = { childList: true, subtree: true };

// Function to check if the domain is a Salesforce domain
function initializeBanner() {
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
                if (currentSubdomain === subdomain.toLowerCase()) {
                    // Extract the remaining domain part
                    const remainingDomain = `.${urlParts.slice(1).join('.')}`;

                    // Check if the remaining domain ends with any of the domains or sandbox.domain
                    const matchedDomain = lowerCaseDomains.find(domain =>
                        remainingDomain.endsWith(`.${domain}`) || remainingDomain.endsWith(`.sandbox.${domain}`)
                    );

                    if (matchedDomain) {
                        const existingBanner = document.querySelector(".slds-notify_alert.slds-notify--alert.oneSystemMessage.banner");
                        if (existingBanner) {
                            existingBanner.remove();
                        }
                        console.log(`Salesforce Org Banner:\nFound matching subdomain: [${currentSubdomain}]\nFound matching domain: [${matchedDomain}]`);
                        createBanner(entry.label, entry.bgColor, entry.textColor);
                        changeFaviconColor(entry.bgColor);
                    }
                }
            });
        }
    });
}

function applyBannerStyles(banner, textColor, bgColor) {
    const currentUrl = window.location.href;
    const isLoginSalesforce = new URL(currentUrl).hostname === "login.salesforce.com";

    Object.assign(banner.style, {
        position: isLoginSalesforce ? "absolute" : "relative",
        display: "block",
        width: "100%",
        padding: "0.5rem 2rem",
        color: textColor,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: bgColor,
        backgroundImage: `linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 75%, transparent 75%, transparent)`,
        backgroundSize: "64px 64px",
        boxSizing: "border-box"
    });
}

function createBanner(text, bgColor = 'red', textColor = 'white') {
    // Locate the existing banner
    const existingBanner = document.querySelector(
        ".slds-notify_alert.system-message.level-info.slds-theme_info[data-message-id='loginAsSystemMessage']"
    );

    if (existingBanner) {
        // Apply the styles to the existing banner
        applyBannerStyles(existingBanner, textColor, bgColor);
        // Apply text color to any hyperlinks within the banner
        const links = existingBanner.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = textColor;
        });
    } else {
        // Create a new banner element
        const banner = document.createElement("div");
        banner.className = "slds-notify_alert slds-notify--alert oneSystemMessage banner";

        // Apply the styles to the new banner
        applyBannerStyles(banner, textColor, bgColor);

        // Add content to the banner
        banner.textContent = text;

        // Locate the "Logged in as" bar
        const sfdcBanner = document.querySelector(
            ".slds-color__background_gray-1.slds-text-align_center.slds-size_full.slds-text-body_regular.oneSystemMessage"
        );

        // Locate the global header
        const globalHeader = document.querySelector(
            ".slds-global-header.slds-grid.slds-grid_align-spread"
        );

        if (sfdcBanner) {
            setTimeout(() => {
                const oneSystemMessage = document.querySelector(".oneSystemMessage");
                const bannerBar = oneSystemMessage?.firstElementChild;

                if (bannerBar) {
                    // Apply the styles to the existing banner
                    applyBannerStyles(bannerBar, textColor, bgColor);
                    // Apply text color to any hyperlinks within the banner
                    const links = bannerBar.querySelectorAll('a');
                    links.forEach(link => {
                        link.style.color = textColor;
                    });
                } else {
                    const sfdcBanner = document.querySelector(
                        ".slds-color__background_gray-1.slds-text-align_center.slds-size_full.slds-text-body_regular.oneSystemMessage"
                    );
                    const banner = document.createElement("div");
                    banner.className = "slds-notify_alert slds-notify--alert oneSystemMessage banner";

                    // Apply the styles to the new banner
                    applyBannerStyles(banner, textColor, bgColor);

                    // Add content to the banner
                    banner.textContent = text;
                    sfdcBanner.parentNode.insertBefore(banner, sfdcBanner);
                    addDimissButton()
                }
            }, 1000); // Wait 1 second
        } else if (globalHeader) {
            // Add the banner before the global header
            globalHeader.parentNode.insertBefore(banner, globalHeader);
        } else {
            // Insert the banner immediately after the <body> tag
            document.body.insertAdjacentElement("afterbegin", banner);
            banner.style.zIndex = "1000"; // Set z-index only if sfdcBanner and globalHeader are not found
        }
        // Log the top left coordinates of the banner
        const rect = banner.getBoundingClientRect();

        // If the top coordinate is greater than 100, change the banner position to absolute
        if (rect.top > 100) {
            banner.style.position = 'absolute';
        }
    }

    addDimissButton()
}

function addDimissButton() {
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

function changeFaviconColor(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    const context = canvas.getContext('2d');
    const img = new Image();
    const oldLink = document.querySelector('link[rel="icon"]');
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

let mutationTimeout; // Used to check if mutations have stopped

// Start observing
observer.observe(targetNode, config);
