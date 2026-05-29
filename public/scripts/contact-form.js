const form = document.querySelector("[data-contact-form]");
const statusNode = document.querySelector("[data-contact-status]");

if (form instanceof HTMLFormElement) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (statusNode) {
      statusNode.textContent = "Sending message...";
    }

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error?.message || "Unable to send message right now.");
      }

      form.reset();
      if (statusNode) {
        statusNode.textContent = "Message sent successfully. We will get back to you soon.";
      }
    } catch (error) {
      if (statusNode) {
        statusNode.textContent = error instanceof Error ? error.message : "Unable to send message right now.";
      }
    }
  });
}
