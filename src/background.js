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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createTabGroup") {
        createTabGroup(request.tabGroupName, request.url);
        sendResponse({ status: "success" });
    }
    return true; // Indicate that the response will be sent asynchronously
});

async function createTabGroup(tabGroupName, url) {
    chrome.tabs.create({ url: url }, async (tab) => {
        let groupId = await getTabGroupIdByName(tabGroupName);
        if (groupId === null) {
            chrome.tabs.group({ tabIds: tab.id }, (newGroupId) => {
                chrome.tabGroups.update(newGroupId, { title: tabGroupName, color: 'blue' });
            });
        } else {
            chrome.tabs.group({ tabIds: tab.id, groupId: groupId });
        }
    });
}

function getTabGroupIdByName(tabGroupName) {
    return new Promise((resolve, reject) => {
        if (!chrome.tabGroups || !chrome.tabGroups.query) {
            reject(new Error("tabGroups API is not available"));
            return;
        }
        chrome.tabGroups.query({}, (groups) => {
            for (let group of groups) {
                if (group.title === tabGroupName) {
                    resolve(group.id);
                    return;
                }
            }
            resolve(null);
        });
    });
}