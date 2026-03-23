const BACKEND_URL = 'http://localhost:8000'

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})

// Listen for page content from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PAGE_CONTENT') {
    // Store in chrome.storage for the sidebar to use
    chrome.storage.local.set({
      pageContent: message.content,
      pageUrl: message.url,
      pageTitle: message.title,
      domStructure: message.domStructure || {},
    })

    // Await the fetch so the service worker stays alive until it completes
    ;(async () => {
      try {
        await fetch(`${BACKEND_URL}/remember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: message.url,
            title: message.title,
            content: message.content,
          }),
        })
      } catch {
        // Backend might not be running - silently ignore
      }
      sendResponse({ success: true })
    })()

    return true // Keep message channel open until sendResponse is called
  }
  return true
})
