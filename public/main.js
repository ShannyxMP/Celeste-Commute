// [x] Test if soundtrack changes as hour is updated:

// Client-side polling every 30 seconds to check if a new hour has begun
setInterval(async () => {
  try {
    const res = await fetch("/current-soundtrack");
    const data = await res.json();

    const audioElement = document.querySelector("#audioPlayer");
    const audioSource = document.querySelector("#audioPlayer source");

    // To retrieve relative URLs/paths to avoid false positives from absolute paths:
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
