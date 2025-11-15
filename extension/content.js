// Content script for Chrome Extension
// Runs on all pages and receives data from background worker

console.log('Detox Extension content script loaded on:', window.location.href);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.type);
  if (request.type === 'WEBSITE_DATA') {
    // Pass data to the page via window message
    console.log('Forwarding website data to page:', request.data);
    window.postMessage({
      type: 'FROM_EXTENSION_WEBSITE_DATA',
      data: request.data
    }, '*');
  }
});

// Request initial data from background
try {
  chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
    console.log('Content script got initial data:', response);
    if (response && response.websites) {
      window.postMessage({
        type: 'FROM_EXTENSION_WEBSITE_DATA',
        data: response
      }, '*');
    }
  });
} catch (e) {
  console.log('Error requesting data from background:', e);
}

// Listen for data requests from the page
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data.type === 'REQUEST_WEBSITE_DATA') {
    console.log('Page requested website data');
    // Request data from background script
    chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
      console.log('Got data from background, sending to page:', response);
      if (response) {
        window.postMessage({
          type: 'FROM_EXTENSION_WEBSITE_DATA',
          data: response
        }, '*');
      }
    });
  }
});

// Send data periodically to page (every 3 seconds)
setInterval(() => {
  try {
    chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
      if (response && response.websites) {
        window.postMessage({
          type: 'FROM_EXTENSION_WEBSITE_DATA',
          data: response
        }, '*');
      }
    });
  } catch (e) {
    // Extension might not be available
  }
}, 3000);
