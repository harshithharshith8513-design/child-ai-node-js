// Load configurations and render popup list
async function loadAndRender() {
    const data = await chrome.storage.local.get(['blockedDomains', 'lastSynced']);
    const domains = data.blockedDomains || [];
    const lastSynced = data.lastSynced;

    // Count indicator
    document.getElementById('domains-count').textContent = domains.length;

    // Last synced time indicator
    const syncTimeEl = document.getElementById('sync-time');
    if (lastSynced) {
        const date = new Date(lastSynced);
        syncTimeEl.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } else {
        syncTimeEl.textContent = 'Never';
    }

    // Render domains list
    const listContainer = document.getElementById('domains-list');
    listContainer.innerHTML = '';

    if (domains.length === 0) {
        listContainer.innerHTML = '<div class="empty-message">No domains blocked.</div>';
    } else {
        domains.forEach(domain => {
            const item = document.createElement('div');
            item.className = 'domain-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = domain;
            
            item.appendChild(nameSpan);
            listContainer.appendChild(item);
        });
    }
}

// Handle manual Sync button action
document.getElementById('sync-btn').addEventListener('click', () => {
    const btn = document.getElementById('sync-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Syncing...';

    chrome.runtime.sendMessage({ action: 'sync' }, (response) => {
        btn.disabled = false;
        btn.textContent = originalText;
        if (response && response.success) {
            loadAndRender();
        } else {
            console.error("Sync failed:", response ? response.error : 'Unknown error');
            alert("Could not sync with ChildGuard AI server. Make sure the backend server is running.");
        }
    });
});

// Run rendering on open
document.addEventListener('DOMContentLoaded', loadAndRender);
