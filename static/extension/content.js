const injectScript = () => {
  try {
    const container = document.head || document.documentElement;
    const script = document.createElement('script');
    script.textContent = `window.childguardExtensionId = "${chrome.runtime.id}";`;
    container.appendChild(script);
    script.remove();

    // Notify background script of the active backend URL
    chrome.runtime.sendMessage({
      action: 'setBackendUrl',
      backendUrl: window.location.origin
    });
  } catch (e) {
    console.error("ChildGuard AI Extension ID Injection / Sync failed:", e);
  }
};
injectScript();

// Listener for unlock messages from the web page context
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data && event.data.type === 'unlockDomain') {
    try {
      chrome.runtime.sendMessage({
        action: 'unlockDomain',
        domain: event.data.domain
      }, (response) => {
        window.postMessage({
          type: 'unlockDomainResponse',
          success: !!(response && response.success)
        }, "*");
      });
    } catch (e) {
      console.error("Failed to forward unlockDomain message to background:", e);
      window.postMessage({
        type: 'unlockDomainResponse',
        success: false
      }, "*");
    }
  }
});
