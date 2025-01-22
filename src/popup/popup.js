document.addEventListener('DOMContentLoaded', () => {
    const tabList = document.getElementById('tabList');
    const tabContent = document.getElementById('tabContent');
    const searchBox = document.getElementById('searchBox');
    const optionsButton = document.getElementById('optionsButton');

    let allEntries = [];
    let entriesByTab = {};
    let activeTab = '';

    optionsButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    chrome.storage.local.get('entries', (result) => {
        if (result.entries && result.entries.length > 0) {
            allEntries = result.entries;
            entriesByTab = result.entries.reduce((acc, entry) => {
                if (!acc[entry.tabname]) {
                    acc[entry.tabname] = [];
                }
                acc[entry.tabname].push(entry);
                return acc;
            }, {});

            Object.keys(entriesByTab).forEach((tabName, index) => {
                const button = document.createElement('button');
                button.textContent = tabName;
                button.addEventListener('click', () => {
                    activeTab = tabName;
                    displayEntries(entriesByTab[tabName]);
                    setActiveTab(button);
                });
                tabList.appendChild(button);
            });

            activeTab = Object.keys(entriesByTab)[0];
            displayEntries(entriesByTab[activeTab]);
            setActiveTab(tabList.querySelector('button'));
        } else {
            chrome.runtime.openOptionsPage();
        }
    });

    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.toLowerCase();
        if (searchTerm === '') {
            displayEntries(entriesByTab[activeTab]);
        } else {
            const filteredEntries = allEntries.filter(entry => entry.label.toLowerCase().includes(searchTerm));
            displayEntries(filteredEntries);
        }
    });

    function displayEntries(entries) {
        tabContent.innerHTML = '';
        const table = document.createElement('table');
        table.innerHTML = `
            <tbody>
                ${entries.map(entry => `
                    <tr class="entry-row" data-subdomain="${entry.subdomain}">
                        <td style="background-color: ${entry.bgColor}; color: ${entry.textColor}; cursor: pointer;">
                            ${entry.label}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tabContent.appendChild(table);

        document.querySelectorAll('.entry-row').forEach(row => {
            row.addEventListener('click', () => {
                const subdomain = row.getAttribute('data-subdomain');
                if (subdomain.includes('--')) {
                    window.open(`https://${subdomain}.sandbox.my.salesforce.com`, '_blank');
                } else {
                    window.open(`https://${subdomain}.my.salesforce.com`, '_blank');
                }
            });
        });
    }

    function setActiveTab(button) {
        const allButtons = tabList.querySelectorAll('button');
        allButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    }
});