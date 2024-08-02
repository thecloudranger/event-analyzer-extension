console.log("Popup script loaded");

document.getElementById("extractButton").addEventListener("click", () => {
  console.log("Extract button clicked");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log("Sending message to content script");
    chrome.tabs.sendMessage(tabs[0].id, { action: "extract" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Message sent successfully");
        // Open the side panel
        chrome.sidePanel
          .open({ tabId: tabs[0].id })
          .then(() => {
            console.log("Side panel opened");
          })
          .catch((error) => {
            console.error("Error opening side panel:", error);
          });
      }
    });
  });
});
