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

// Set initial audio volume to 20%
var audio = document.querySelector("audio");
audio.volume = 0.2;

// Event listener for the settings button
document.addEventListener("DOMContentLoaded", () => {
  const settings = document.querySelector("#settings");
  const form = document.querySelector("#form");

  settings.addEventListener("click", () => {
    // Toggle settings form visibility when settings button is clicked
    form.classList.toggle("collapsed");
  });
});
