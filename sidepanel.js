console.log("Side panel script loaded");

let eventsData = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in side panel:", request);
  if (request.action === "updateSidePanel") {
    eventsData = request.events;
    displayEvents(eventsData);
  }
});

function displayEvents(events) {
  console.log("Displaying events:", events);
  const eventList = document.getElementById("eventList");
  eventList.innerHTML = "";
  if (!events || events.length === 0) {
    eventList.innerHTML = "<p>No events to display.</p>";
    return;
  }
  events.forEach((event, index) => {
    const eventElement = document.createElement("div");
    eventElement.className = "event";
    eventElement.innerHTML = `
      <div class="event-header">
        <h2>${event.title}</h2>
        <span class="toggle-icon">▼</span>
      </div>
      <p>${event.date}</p>
      <div class="details">
        <p>${event.details || "No details available."}</p>
        <a href="${event.link}" target="_blank">View Event</a>
      </div>
    `;
    eventList.appendChild(eventElement);

    // Add click event listener to the header
    const header = eventElement.querySelector(".event-header");
    header.addEventListener("click", () => toggleDetails(eventElement));
  });
}

function toggleDetails(eventElement) {
  const details = eventElement.querySelector(".details");
  const toggleIcon = eventElement.querySelector(".toggle-icon");

  if (details.style.maxHeight) {
    details.style.maxHeight = null;
    toggleIcon.textContent = "▼";
  } else {
    details.style.maxHeight = details.scrollHeight + "px";
    toggleIcon.textContent = "▲";
  }
}

// Export functions
function exportCSV() {
  if (!eventsData) return;

  let csv = "Title,Date,Details,Link\n";
  eventsData.forEach((event) => {
    csv += `"${event.title}","${event.date}","${event.details.replace(
      /"/g,
      '""'
    )}","${event.link}"\n`;
  });

  downloadFile(csv, "events.csv", "text/csv");
}

function exportJSON() {
  if (!eventsData) return;

  const json = JSON.stringify(eventsData, null, 2);
  downloadFile(json, "events.json", "application/json");
}

function exportPDF() {
  if (!eventsData) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  eventsData.forEach((event, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let yOffset = 20;

    doc.setFontSize(16);
    doc.text(event.title, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.text(event.date, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(10);
    const detailsLines = doc.splitTextToSize(event.details, 180);
    doc.text(detailsLines, 10, yOffset);
    yOffset += detailsLines.length * 5 + 10;

    doc.setTextColor(0, 0, 255);
    doc.textWithLink("View Event", 10, yOffset, { url: event.link });
    doc.setTextColor(0, 0, 0);
  });

  doc.save("events.pdf");
}

function downloadFile(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

// Add event listeners for export buttons
document.getElementById("exportCSV").addEventListener("click", exportCSV);
document.getElementById("exportJSON").addEventListener("click", exportJSON);
document.getElementById("exportPDF").addEventListener("click", exportPDF);

// Notify background script that side panel is ready
chrome.runtime.sendMessage({ action: "sidePanelReady" });

// Check if we already have events data (in case the panel was already open)
if (eventsData) {
  displayEvents(eventsData);
}
