/**
 * Salesforce Org Banner Popup
 * Manages the popup UI for selecting Salesforce orgs
 */
document.addEventListener('DOMContentLoaded', () => {
    const popupManager = new PopupManager();
    popupManager.initialize();
});

/**
 * PopupManager class to handle all popup functionality
 */
class PopupManager {
    constructor() {
        // UI Elements
        this.tabList = document.getElementById('tabList');
        this.tabContent = document.getElementById('tabContent');
        this.searchBox = document.getElementById('searchBox');
        this.optionsButton = document.getElementById('optionsButton');
        
        // Data storage
        this.allEntries = [];
        this.entriesByTab = {};
        this.activeTab = '';
    }

    /**
     * Initialize the popup
     */
    initialize() {
        this.attachEventListeners();
        this.loadEntries();
    }

    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        this.optionsButton.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        this.searchBox.addEventListener('input', () => {
            this.handleSearch();
        });
    }

    /**
     * Handle search input
     */
    handleSearch() {
        const searchTerm = this.searchBox.value.toLowerCase();
        
        if (searchTerm === '') {
            this.displayEntries(this.entriesByTab[this.activeTab]);
        } else {
            const filteredEntries = this.allEntries.filter(entry => 
                entry.label.toLowerCase().includes(searchTerm)
            );
            this.displayEntries(filteredEntries);
        }
    }

    /**
     * Load entries from storage
     */
    loadEntries() {
        chrome.storage.local.get('entries', (result) => {
            if (result.entries && result.entries.length > 0) {
                this.processEntries(result.entries);
            } else {
                chrome.runtime.openOptionsPage();
            }
        });
    }

    /**
     * Process loaded entries
     */
    processEntries(entries) {
        this.allEntries = entries;
        this.organizeEntriesByTab();
        this.createTabButtons();
        
        // Set initial active tab
        this.activeTab = Object.keys(this.entriesByTab)[0];
        this.displayEntries(this.entriesByTab[this.activeTab]);
        this.setActiveTab(this.tabList.querySelector('button'));
    }

    /**
     * Organize entries by tab
     */
    organizeEntriesByTab() {
        this.entriesByTab = this.allEntries.reduce((acc, entry) => {
            if (!acc[entry.tabname]) {
                acc[entry.tabname] = [];
            }
            acc[entry.tabname].push(entry);
            return acc;
        }, {});
    }

    /**
     * Create tab buttons
     */
    createTabButtons() {
        for (const tabName of Object.keys(this.entriesByTab)) {
            const button = document.createElement('button');
            button.textContent = tabName;
            button.addEventListener('click', () => {
                this.activeTab = tabName;
                this.displayEntries(this.entriesByTab[tabName]);
                this.setActiveTab(button);
            });
            this.tabList.appendChild(button);
        }
    }

    /**
     * Display entries in the tab content area
     */
    displayEntries(entries) {
        this.tabContent.innerHTML = '';
        
        const table = document.createElement('table');
        table.innerHTML = `
            <tbody>
                ${entries.map(entry => `
                    <tr class="entry-row" data-subdomain="${entry.subdomain}" data-tabname="${entry.tabname}">
                        <td style="background-color: ${entry.bgColor}; color: ${entry.textColor}; cursor: pointer;">
                            ${entry.label}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        this.tabContent.appendChild(table);
        this.attachRowEventListeners();
    }

    /**
     * Attach event listeners to entry rows
     */
    attachRowEventListeners() {
        const entryRows = document.querySelectorAll('.entry-row');
        for (const row of entryRows) {
            row.addEventListener('click', () => {
                this.openSalesforceTab(row);
            });
        }
    }

    /**
     * Set the active tab
     */
    setActiveTab(button) {
        const allButtons = this.tabList.querySelectorAll('button');
        for (const btn of allButtons) {
            btn.classList.remove('active');
        }
        button.classList.add('active');
    }

    /**
     * Open a Salesforce tab
     */
    openSalesforceTab(row) {
        const subdomain = row.getAttribute('data-subdomain');
        const tabname = row.getAttribute('data-tabname');
        const url = this.buildSalesforceUrl(subdomain);

        this.navigateToUrl(url, tabname);
    }

    /**
     * Build the Salesforce URL
     */
    buildSalesforceUrl(subdomain) {
        return subdomain.includes('--')
            ? `https://${subdomain}.sandbox.my.salesforce.com`
            : `https://${subdomain}.my.salesforce.com`;
    }

    /**
     * Navigate to the URL considering tab group settings
     */
    navigateToUrl(url, tabname) {
        chrome.storage.local.get('useTabGroups', (result) => {
            const useTabGroups = result.useTabGroups || false;

            if (useTabGroups) {
                this.createTabGroup(url, tabname);
            } else {
                window.open(url, '_blank');
            }
        });
    }

    /**
     * Create a tab group
     */
    createTabGroup(url, tabGroupName) {
        chrome.runtime.sendMessage({
            action: "createTabGroup",
            tabGroupName: tabGroupName,
            url: url
        });
    }
}