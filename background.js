console.log("Background script loaded");

let sidePanelReady = false;
let pendingEvents = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background script:", request);
  if (request.action === "processEvents") {
    processEvents(request.events);
  } else if (request.action === "sidePanelReady") {
    sidePanelReady = true;
    console.log("Side panel is ready");
    if (pendingEvents) {
      updateSidePanel(pendingEvents);
      pendingEvents = null;
    }
  }
});

async function processEvents(events) {
  console.log("Processing events:", events);
  const processedEvents = [];
  for (const event of events) {
    const details = await getEventDetails(event.link);
    processedEvents.push({ ...event, details });
  }
  updateSidePanel(processedEvents);
}

async function getEventDetails(url) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url, active: false }, (tab) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          function: extractEventDetails,
        },
        (results) => {
          chrome.tabs.remove(tab.id);
          resolve(results[0].result);
        }
      );
    });
  });
}

function extractEventDetails() {
  const detailsElement = document.getElementById("event-details");
  return detailsElement ? detailsElement.textContent : "Details not found";
}

function updateSidePanel(events) {
  console.log("Updating side panel with events:", events);
  if (sidePanelReady) {
    chrome.runtime.sendMessage({ action: "updateSidePanel", events });
  } else {
    console.log("Side panel not ready, storing events for later");
    pendingEvents = events;
  }
}

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
