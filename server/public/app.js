const form = document.querySelector("#feedback-form");
const submitButton = document.querySelector("#submit-button");
const statusMessage = document.querySelector("#form-status");
const feedbackList = document.querySelector("#feedback-list");
const entryCount = document.querySelector("#entry-count");

function showFeedback(entries) {
  feedbackList.replaceChildren();
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? "message" : "messages"}`;

  if (entries.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "No messages yet. Yours can be the first.";
    feedbackList.append(emptyMessage);
    return;
  }

  for (const entry of entries) {
    const card = document.createElement("article");
    card.className = "feedback-item";

    const header = document.createElement("div");
    header.className = "feedback-item-header";
    const name = document.createElement("strong");
    name.textContent = entry.name;
    const date = document.createElement("time");
    date.dateTime = entry.createdAt;
    date.textContent = new Date(entry.createdAt).toLocaleString();
    header.append(name, date);

    const message = document.createElement("p");
    message.textContent = entry.message;
    card.append(header, message);

    const socialLinks = document.createElement("div");
    socialLinks.className = "social-links";
    for (const [label, url] of [["Instagram", entry.instagram], ["LinkedIn", entry.linkedin]]) {
      if (!url) continue;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      socialLinks.append(link);
    }
    if (socialLinks.childElementCount > 0) card.append(socialLinks);

    feedbackList.append(card);
  }
}

async function loadFeedback() {
  const response = await fetch("/api/feedback");
  if (!response.ok) throw new Error("Could not load feedback.");
  const entries = await response.json();
  showFeedback(entries);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.textContent = "Sending your message…";
  statusMessage.classList.remove("error");
  submitButton.disabled = true;

  const formData = new FormData(form);
  const feedback = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Could not send feedback.");

    form.reset();
    statusMessage.textContent = "Thanks — your feedback was received.";
    await loadFeedback();
  } catch (error) {
    statusMessage.textContent = error.message || "Could not reach the server. Is it running?";
    statusMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
  }
});

loadFeedback().catch((error) => {
  statusMessage.textContent = error.message;
  statusMessage.classList.add("error");
});
