// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id })
  }
})

// Listen for page content from content script
// Store in chrome.storage.local (never in-memory - service worker shuts down)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PAGE_CONTENT') {
    chrome.storage.local.set({
      pageContent: message.content,
      pageUrl: message.url,
      pageTitle: message.title,
    })
    sendResponse({ success: true })
  }
  return true
})
