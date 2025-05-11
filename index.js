import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const baseURL = "https://ac-api.vercel.app/";

// Middlewares:
app.use(express.static("public")); // Handle static files
app.use(bodyParser.urlencoded()); // Parse incoming form data

let lastFetchedHour, currentSoundtrack;

// To get current time:
function getCurrentHour() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
  }); // Output eg.: 06 pm
}

// Update song on server-side every hour:
async function checkAndUpdateHour() {
  const hourNow = getCurrentHour();

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

// Route(s):
app.get("/", async (req, res) => {
  const requestedSoundtrack = req.query.manual === "true"; // === "true" checks if the value is exactly the string "true" | If the URL contains ?manual=true, then isManual will be true
  const requestedTime = req.query.time;
  // Render homepage with initial soundtrack and time
  res.render("index.ejs", {
    message: currentSoundtrack
      ? null
      : "Unable to retrieve selected sountrack.",
    soundtrack: currentSoundtrack,
    time:
      requestedSoundtrack && requestedTime ? requestedTime : lastFetchedHour, // If requestedSoundtrack is true and requestedTime (e.g., "1PM", "9AM") is provided, use customTime for the time value passed
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

// [x] Handle issue with soundtrack being changed every 30secs due to /current-soundtrack -> setInterval
app.post("/set-soundtrack", async (req, res) => {
  // Handle incoming request to change hourly soundtrack based on selected time by client
  const selectedTime = req.body.setTime; // Output eg.: 12AM
  console.log(`You are changing the time to ${selectedTime}`);

  if (selectedTime) {
    try {
      const result = await axios.get(`${baseURL}api/?time=${selectedTime}`);
      const wantedSoundtrack = result.data.music[1].file;

      // Update global variables:
      lastFetchedHour = req.body.setTime;
      currentSoundtrack = wantedSoundtrack;

      // Redirect to homepage with manual override flag
      res.redirect(`/?manual=true&time=${encodeURIComponent(selectedTime)}`); // encodeURIComponent() makes sure special characters (like AM, PM) in the time string are safely included in the URL
    } catch (error) {
      console.error("Error fetching manual soundtrack: ", error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
