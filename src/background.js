// Description: This file is responsible for handling the background tasks of the extension.
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "update") {
        const currentVersion = chrome.runtime.getManifest().version;

        // Open the release notes page
        chrome.tabs.create({
            url: `release_notes/release_notes.html`
        });
    }
});
