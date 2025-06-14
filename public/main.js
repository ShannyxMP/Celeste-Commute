// ********** CHANGE SOUNDTRACK SECTION **********
// Poll the server every 30 seconds to check if the soundtrack has changed

const songWasRequested = window.location.search.includes("manual=true"); // Skip polling if the URL includes a manual override flag (?manual=true)

if (!songWasRequested) {
  setInterval(async () => {
    try {
      const res = await fetch("/current-soundtrack");
      const data = await res.json();

      const audioElement = document.querySelector("#audioPlayer");
      const audioSource = document.querySelector("#audioPlayer source");

      // Extract relative paths from absolute URLs to compare current vs. new soundtrack (avoids false-positives)
      const currentSoundtrack = new URL(audioSource.src).pathname;
      const newSoundtrack = new URL(data.soundtrack, window.location.origin) // window.location.origin required as the base URL (e.g., http://localhost:3000) to build a proper absolute URL - no base may cause error when passed directly to new URL(...)
        .pathname;

      console.log(
        `Currently playing: ${currentSoundtrack}. If ${newSoundtrack} pathname is different, it will be the new song to be played.`
      );

      // Update soundtrack if server-fetched audio differs from the one currently playing
      if (currentSoundtrack !== newSoundtrack) {
        audioSource.src = data.soundtrack;
        audioElement.load();
        if (audioElement.play()) {
          audioElement.play();
        }
        console.log(`Soundtrack changed to: ${audioSource.src}`);
      }

      // Update time display
      document.querySelector("#displayTime").textContent = data.time;
    } catch (error) {
      console.error("API fetch error: ", error.message);
    }
  }, 30000); // To fetch data every 30secs
}

// ********** AUDIO CONFIGURATION SECTION **********
// Set initial audio volume to 20%
var audio = document.querySelector("audio");
audio.volume = 0.2;

// ********** VISIBLE BODY CONFIGURATION SECTION **********

setInterval(async () => {
  if (!audio.paused) {
    document.querySelector("#titleImage").classList.remove("visible");
    document.querySelector("#audio-container").classList.add("move");
  } else {
    document.querySelector("#titleImage").classList.add("visible");
    document.querySelector("#audio-container").classList.remove("move");
  }
}, 1000);

// ********** FORM CONFIGURATION SECTION **********
// Event listener for the settings button
document.addEventListener("DOMContentLoaded", () => {
  const settings = document.querySelector("#settings");
  const form = document.querySelector("#form");

  settings.addEventListener("click", () => {
    // Toggle settings form visibility when settings button is clicked
    form.classList.toggle("collapsed");
  });
});

// ********** KIND REMINDERS SECTION **********
const reminders = [
  // 🌟 General Positivity
  "You got this!",
  "Keep going!",
  "One step at a time.",
  "You've come so far.",
  "You're doing great!",
  "You're stronger than you think.",
  "Every little bit counts.",
  "Be kind to yourself.",

  // 🌙 Calming & Supportive
  "Take a deep breath.",
  "It's okay to slow down.",
  "Rest is productive.",
  "You deserve peace.",
  "Let the calm in.",

  // 💪 Motivational
  "Stay curious.",
  "You're making progress.",
  "Tiny wins are still wins.",
  "Keep showing up.",
  "Believe in your pace.",

  // 🍃 Wholesome & Friendly
  "You're not alone.",
  "You matter.",
  "Today is yours.",
  "The stars are cheering for you.",
  "Even clouds make way for sunshine.",
];

// Update kind reminder every 5minutes
function postKindReminder() {
  if (!audio.paused) {
    const reminderBox = document.querySelector("#reminder-text");
    const reminderText = document.querySelector("#reminder-text p");
    const speechBubble = document.querySelector("#reminder-grid-container img");

    const randomNumber = Math.floor(Math.random() * reminders.length);
    const newReminder = reminders[randomNumber];
    // console.log(newReminder);

    if (reminderText.innerHTML !== newReminder) {
      // Fade out first
      reminderBox.classList.remove("visible");
      speechBubble.classList.remove("visible");

      // (2nd) Wait for the fade-out to complete before updating the text
      setTimeout(() => {
        reminderText.innerHTML = newReminder;

        // Fade in the new text
        reminderBox.classList.add("visible");
        speechBubble.classList.add("visible");

        // (3rd) Fade out after delay
        setTimeout(() => {
          reminderBox.classList.remove("visible");
          speechBubble.classList.remove("visible");
        }, 10000); // (3rd) Keep it visible for 10seconds
      }, 500); // (2nd) Match fade-out duration set in CSS -> (transition: opacity 0.5s ...)
    }
  }
}
setInterval(postKindReminder, 300000); // (1st) Interval set to 5minutes

// ********** TIME CONFIGURATION SECTION **********
// To get current date and time:
function getCurrentDateAndTime() {
  const now = new Date();
  let hour = now.getHours(); // Output eg.: 4
  let minute = now.getMinutes(); // Output eg.: 8
  let ampm = hour >= 12 ? "PM" : "AM";

  console.log(ampm);

  // Convert to 12-hour format
  hour = hour % 12 || 12; // <-- If the result of hour % 12 is 0, then use 12

  // Get current date:
  let month = now.getMonth() + 1; // <- +1 as .getMonth() begins with 0
  let dayNum = now.getDate();

  // Convert to string and ensure string has at least two characters, if not, it will add 0
  hour = hour.toString().padStart(2, "0"); // Output eg.: "04"
  minute = minute.toString().padStart(2, "0");
  month = month.toString().padStart(2, "0");
  dayNum = dayNum.toString().padStart(2, "0");

  dayOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let dayChar = dayOfWeek[now.getDay()];

  document.querySelector("#hour").innerHTML = hour;
  document.querySelector("#minute").innerHTML = minute;
  document.querySelector("#ampm").innerHTML = ampm;
  document.querySelector("#dayChar").innerHTML = dayChar;
  document.querySelector("#dayNum").innerHTML = dayNum;
  document.querySelector("#month").innerHTML = month;
}
setInterval(getCurrentDateAndTime, 5000);
getCurrentDateAndTime();
