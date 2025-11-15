// Popup script for extension

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
    // Request data from background script
    chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
        if (response && response.websites) {
            updateUI(response.websites);
        }
    });
    
    // Attach event listeners
    document.getElementById('dashboardBtn').addEventListener('click', openDashboard);
    document.getElementById('viewDataBtn').addEventListener('click', viewData);
    document.getElementById('resetDataBtn').addEventListener('click', resetData);
});

function updateUI(websites) {
    const websiteCount = Object.keys(websites).length;
    const totalTime = Object.values(websites).reduce((a, b) => a + b, 0);
    const totalMinutes = Math.round(totalTime / 60000);
    
    // Update counters
    document.getElementById('websites').textContent = websiteCount;
    document.getElementById('time').textContent = totalMinutes + 'm';
    document.getElementById('status').textContent = 'Active ✓';
    
    console.log('Websites tracked:', websites);
}

function openDashboard() {
    // Try to open dashboard in new tab
    chrome.tabs.create({
        url: 'file://' + chrome.runtime.getURL('../pages/dashboard.html')
    });
    window.close();
}

function viewData() {
    // Request data from background and log it
    chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
        if (response && response.websites) {
            console.log('Current tracked data:', response.websites);
            alert('Data:\n' + JSON.stringify(response.websites, null, 2));
        }
    });
}

function resetData() {
    if (confirm('Are you sure you want to reset today\'s data?')) {
        chrome.storage.local.set({ websiteTimeData: {} }, () => {
            alert('Data reset successfully!');
            document.getElementById('websites').textContent = '0';
            document.getElementById('time').textContent = '0m';
        });
    }
}
