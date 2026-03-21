function extractPageText(): string {
  // Clone DOM to avoid modifying the actual page
  const clone = document.cloneNode(true) as Document

  // Remove noise elements
  const noiseSelectors = ['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript']
  noiseSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove())
  })

  const text = clone.body?.innerText || ''

  // Collapse excessive whitespace and limit size
  return text.replace(/\s+/g, ' ').trim().slice(0, 10000)
}

function sendPageContent() {
  const content = extractPageText()

  // Skip empty or very short pages (e.g. blank tabs)
  if (content.length < 50) return

  chrome.runtime.sendMessage({
    type: 'PAGE_CONTENT',
    content,
    url: window.location.href,
    title: document.title,
  })
}

// Wait for page to fully load before extracting
if (document.readyState === 'complete') {
  sendPageContent()
} else {
  window.addEventListener('load', sendPageContent)
}
