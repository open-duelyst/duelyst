// Pass in a URL to open
function openUrl(url) {
  if (window.isDesktop) {
    // Use the 'open' module to open in their default browser
    // window.openUrl is injected by Electron
    window.openUrl(url);
  } else {
    // Open the URL in a new tab
    window.open(url, '_blank');
  }
}

module.exports = openUrl;
