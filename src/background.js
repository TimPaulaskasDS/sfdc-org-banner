const salesforceDomains = [
    '.bluetail.salesforce.com',
    '.force.com',
    '.forceusercontent.com',
    '.force-user-content.com',
    '.salesforce.com',
    '.salesforceliveagent.com',
    '.salesforce-experience.com',
    '.salesforce-hub.com',
    '.salesforce-scrt.com',
    '.salesforce-setup.com',
    '.salesforce-sites.com',
    '.sfdcopens.com',
    '.trailhead.com',
    '.documentforce.com',
    '.lightning.com',
    '.salesforce-communities.com',
    '.sfdc.sh',
    '.visualforce.com',
    '.site.com'
];

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (tab.url && isSalesforceDomain(tab.url)) {
            chrome.action.enable(activeInfo.tabId);
            chrome.action.setIcon({ tabId: activeInfo.tabId, path: 'assets/icon-32.png' }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to set icon: ${chrome.runtime.lastError.message}`);
                }
            });
        } else {
            chrome.action.disable(activeInfo.tabId);
            chrome.action.setIcon({ tabId: activeInfo.tabId, path: 'assets/icon-disabled-32.png' }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to set icon: ${chrome.runtime.lastError.message}`);
                }
            });
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        if (tab.url && isSalesforceDomain(tab.url)) {
            chrome.action.enable(tabId);
            chrome.action.setIcon({ tabId: tabId, path: 'assets/icon-32.png' }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to set icon: ${chrome.runtime.lastError.message}`);
                }
            });
        } else {
            chrome.action.disable(tabId);
            chrome.action.setIcon({ tabId: tabId, path: 'assets/icon-disabled-32.png' }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Failed to set icon: ${chrome.runtime.lastError.message}`);
                }
            });
        }
    }
});

function isSalesforceDomain(url) {
    return salesforceDomains.some(domain => url.toLowerCase().includes(domain.toLowerCase()));
}