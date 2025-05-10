import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const baseURL = "https://ac-api.vercel.app/";

let lastFetchedHour, currentSoundtrack;

// To get current time:
function getCurrentHour() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
  }); // Output eg.: 06 PM
}

// Update song on server-side every hour:
async function checkAndUpdateHour() {
  const hourNow = getCurrentHour();

  // [x] Confirm song updates when the hour changes
  if (hourNow !== lastFetchedHour) {
    try {
      const result = await axios.get(`${baseURL}api/?time=${hourNow}`);
      currentSoundtrack = result.data.music[1].file; // music[1] selects the "New Leaf" game soundtrack - array indices map to: 0 = New Horizons, 1 = New Leaf, 2 = City Folk, 3 = GameCube
      lastFetchedHour = hourNow;
    } catch (error) {
      console.error("API fetch error: ", error.message);
      currentSoundtrack: null;
    }
  }
  // console.log(lastFetchedHour);
}
setInterval(checkAndUpdateHour, 30000); // Periodically check if the hour has changed; if so, fetch the new track from external API
checkAndUpdateHour(); // Run once at startup

// Middlewares:
app.use(express.static("public")); // Handle static files

// Route(s):
app.get("/", async (req, res) => {
  // Render homepage with initial soundtrack and time
  res.render("index.ejs", {
    message: currentSoundtrack ? null : "Unable to retrieve file.",
    soundtrack: currentSoundtrack,
    time: lastFetchedHour,
  });
});

app.get("/current-soundtrack", (req, res) => {
  // Fetch the current soundtrack and time (polled every 30s)
  res.json({
    // Return current soundtrack and time as JSON for client polling
    soundtrack: currentSoundtrack,
    time: lastFetchedHour,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
