import { createBackground } from "@uppercut-labs/retro-game-backgrounds";
import scene from "@uppercut-labs/retro-game-backgrounds/scenes/atlas-of-little-worlds";
import "./style.css";

const host: HTMLElement | null = document.querySelector("#background");
if (host !== null) {
  try {
    createBackground({
      element: host,
      scene,
      console: "dreamcast",
      motion: "ambient",
      quality: "auto",
    });
  } catch (error: unknown) {
    console.warn("Background unavailable", error);
  }
}

const form: HTMLFormElement | null = document.querySelector("#inquiry-form");
const status: HTMLElement | null = document.querySelector("#form-status");
form?.addEventListener("submit", (event: SubmitEvent): void => {
  event.preventDefault();
  if (form === null || status === null) return;
  const button: HTMLButtonElement | null = form.querySelector(
    'button[type="submit"]',
  );
  const data: FormData = new FormData(form);
  const payload: Record<string, string> = {};
  for (const key of ["name", "email", "help", "scope"]) {
    payload[key] = String(data.get(key) ?? "").trim();
  }
  if (button !== null) button.disabled = true;
  status.textContent = "Sending your inquiry…";
  fetch("/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (response: Response): Promise<void> => {
      if (!response.ok) throw new Error("Unable to send inquiry");
      form.reset();
      status.textContent = "Your inquiry was sent. Thank you!";
    })
    .catch((): void => {
      status.textContent =
        "Sorry, your inquiry could not be sent. Please email rampup@uppercut-labs.com.";
    })
    .finally((): void => {
      if (button !== null) button.disabled = false;
    })
    .catch((error: unknown): void => {
      console.error("Unable to update inquiry form", error);
    });
});
