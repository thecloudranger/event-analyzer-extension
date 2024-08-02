console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "extract") {
    try {
      console.log("Starting event extraction");
      const pastEvents = extractPastEvents();
      console.log("Extracted events:", pastEvents);
      if (pastEvents.length > 0) {
        chrome.runtime.sendMessage({
          action: "processEvents",
          events: pastEvents,
        });
      } else {
        console.log("No past events found");
        chrome.runtime.sendMessage({ action: "noEventsFound" });
      }
    } catch (error) {
      console.error("Error extracting past events:", error);
      chrome.runtime.sendMessage({
        action: "extractionError",
        error: error.message,
      });
    }
  }
  sendResponse({ received: true }); // Always send a response
  return true; // Indicates that the response is sent asynchronously
});

function extractPastEvents() {
  const eventCards = document.querySelectorAll('[id^="past-event-card-"]');
  return Array.from(eventCards)
    .map((card) => {
      let link = "";
      let title = "";
      let date = "";

      // Find the link
      const anchorElement = card; // The card itself is the anchor element
      if (anchorElement && anchorElement.href) {
        link = anchorElement.href;
      }

      // Find the title
      const titleElement = card.querySelector(".ds-font-title-3");
      if (titleElement) {
        title = titleElement.textContent.trim();
      }

      // Find the date
      const dateElement = card.querySelector("time");
      if (dateElement) {
        date = dateElement.textContent.trim();
      }

      // Log for debugging
      console.log("Extracted event:", { link, title, date });

      return { link, title, date };
    })
    .filter((event) => event.link); // Only return events with a valid link
}
