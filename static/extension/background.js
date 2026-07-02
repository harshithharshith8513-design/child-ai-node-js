let BACKEND_URL = 'http://localhost:8000';

// Load stored backend URL if it exists
chrome.storage.local.get('backendUrl').then((result) => {
    if (result.backendUrl) {
        BACKEND_URL = result.backendUrl;
        console.log("Loaded stored backend URL:", BACKEND_URL);
    }
});

// Synchronize configurations from backend sqlite
async function syncFromBackend() {
    console.log("Synchronizing details from ChildGuard AI backend...");
    try {
        // 1. Fetch blocked domains
        const domainsRes = await fetch(`${BACKEND_URL}/api/blocked-urls`);
        if (!domainsRes.ok) throw new Error("Domains endpoint error");
        const domains = await domainsRes.ok ? await domainsRes.json() : [];
        if (Array.isArray(domains)) {
            await chrome.storage.local.set({ blockedDomains: domains });
        }

        // 2. Fetch biometric parent/child profiles
        const profilesRes = await fetch(`${BACKEND_URL}/api/sync-profiles`);
        if (!profilesRes.ok) throw new Error("Profiles endpoint error");
        const profiles = await profilesRes.ok ? await profilesRes.json() : [];
        if (Array.isArray(profiles)) {
            await chrome.storage.local.set({ syncedProfiles: profiles });
        }

        await chrome.storage.local.set({ lastSynced: new Date().toISOString() });
        console.log("Sync completed. Loaded profiles:", profiles.length, "domains:", domains.length);
        
        await applyActiveRules();
    } catch (err) {
        console.warn("Backend offline, utilizing cached storage configurations:", err.message);
        await applyActiveRules();
    }
}

// Compute active domains and configure declarativeNetRequest redirect rules
async function applyActiveRules() {
    try {
        const storage = await chrome.storage.local.get(['blockedDomains', 'bypassList']);
        const domains = storage.blockedDomains || [];
        const bypassList = storage.bypassList || {};
        
        const now = Date.now();
        // Exclude domains that are currently within their whitelisted bypass window
        const activeBlocks = domains.filter(domain => {
            const expiry = bypassList[domain];
            return !expiry || expiry < now;
        });

        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const removeRuleIds = existingRules.map(r => r.id);

        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const addRules = activeBlocks.map((domain, index) => {
            const ruleId = index + 1;
            // Matches http://facebook.com/..., https://www.facebook.com/, etc.
            const regexFilter = `^https?://(?:www\\.)?(${escapeRegex(domain)})($|/.*)`;
            return {
                id: ruleId,
                priority: 1,
                action: {
                    type: 'redirect',
                    redirect: {
                        regexSubstitution: `${BACKEND_URL}/gatekeeper?domain=\\1`
                    }
                },
                condition: {
                    regexFilter: regexFilter,
                    resourceTypes: ['main_frame']
                }
            };
        });

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
            addRules
        });
        console.log(`DNR Rules Applied: Blocking ${activeBlocks.length} sites. Whitelisted:`, Object.keys(bypassList));
    } catch (err) {
        console.error("Error applying DNR rules:", err);
    }
}

// Set up alarms and sync triggers
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('sync_alarm', { periodInMinutes: 1 });
    syncFromBackend();
});

chrome.runtime.onStartup.addListener(() => {
    syncFromBackend();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'sync_alarm') {
        syncFromBackend();
    } else if (alarm.name.startsWith('relock_')) {
        const domain = alarm.name.replace('relock_', '');
        handleBypassExpiry(domain);
    }
});

async function handleBypassExpiry(domain) {
    const storage = await chrome.storage.local.get('bypassList');
    const bypassList = storage.bypassList || {};
    delete bypassList[domain];
    await chrome.storage.local.set({ bypassList });
    await applyActiveRules();
    console.log(`Bypass expired. Re-blocked access to domain: ${domain}`);
}

// Messages listener from popups or block screens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setBackendUrl') {
        const newUrl = message.backendUrl;
        if (newUrl && newUrl !== BACKEND_URL) {
            BACKEND_URL = newUrl;
            chrome.storage.local.set({ backendUrl: newUrl }).then(() => {
                console.log("Updated active backend URL to:", BACKEND_URL);
                syncFromBackend();
            });
        }
        return false;
    }

    if (message.action === 'sync') {
        syncFromBackend().then(() => {
            sendResponse({ success: true });
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }
    
    if (message.action === 'unlockDomain') {
        const domain = message.domain;
        chrome.storage.local.get('bypassList').then(async (storage) => {
            const bypassList = storage.bypassList || {};
            // Whitelist domain for 15 minutes
            bypassList[domain] = Date.now() + 15 * 60 * 1000;
            await chrome.storage.local.set({ bypassList });
            await applyActiveRules();
            
            // Set alarm to automatically re-lock after 15 minutes
            chrome.alarms.create(`relock_${domain}`, { delayInMinutes: 15 });
            
            sendResponse({ success: true });
        });
        return true;
    }
});
