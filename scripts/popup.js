const runButton = document.getElementById('run-extension');
runButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['scripts/content.js']
    });
    window.close();
  } catch (error) {
    console.error('Failed to run extension on this page:', error);
  }
});
