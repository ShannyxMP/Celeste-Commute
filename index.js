// TODO: For future updates — store user-specific settings (like game/time) using sessions or query params - so multiple users don’t override each other’s soundtrack settings

import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const baseURL = "https://ac-api.vercel.app/";

// Middlewares:
app.use(express.static("public")); // Handle static files
app.use(bodyParser.urlencoded({ extended: true })); // Parse incoming form data

let lastFetchedHour, currentSoundtrack;
let gameIndex = 1; // music[gameIndex] = 1 selects the "New Leaf" game soundtrack BY DEFAULT - array indices map to: 0 = New Horizons, 1 = New Leaf, 2 = City Folk, 3 = GameCube
let gameTitle = "";

// To get current hour:
function getCurrentHour() {
  let hour = new Date().getHours();
  let ampm = hour >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hour = hour % 12 || 12; // <-- If the result of hour % 12 is 0, then use 12

  return { hour, ampm };
}

async function checkAndUpdateHour() {
  const { hour, ampm } = getCurrentHour();

  // Update song on server-side every hour:
  const hourNow = hour + ampm; // Outputs: 4PM
  if (hourNow !== lastFetchedHour) {
    try {
      const result = await axios.get(`${baseURL}api/?time=${hourNow}`);
      currentSoundtrack = result.data.music[gameIndex].file;
      lastFetchedHour = hourNow;
      gameTitle = result.data.music[gameIndex].game;
    } catch (error) {
      console.error("API fetch error: ", error.message);
      currentSoundtrack = null;
    }
  }
  // console.log(lastFetchedHour);
}
setInterval(checkAndUpdateHour, 30000); // Periodically (30seconds) check if the hour has changed; if so, fetch the new track from external API
checkAndUpdateHour(); // Run once at startup

// Route(s):
app.get("/", async (req, res) => {
  const requestedSoundtrack = req.query.manual === "true"; // === "true" checks if the value is exactly the string "true" | If the URL contains ?manual=true, then 'songWasRequested' (in main.js) will be true
  const requestedTime = req.query.time;
  // Render homepage with initial soundtrack and time
  res.render("index.ejs", {
    message: currentSoundtrack
      ? null
      : "Unable to retrieve selected soundtrack. Try and refresh the page.",
    game: gameTitle,
    soundtrack: currentSoundtrack,
    soundtrackTime:
      requestedSoundtrack && requestedTime ? requestedTime : lastFetchedHour, // If requestedSoundtrack is true and requestedTime (e.g., "1PM", "9AM") is provided, use customTime for the time value passed
  });
});

app.get("/current-soundtrack", (req, res) => {
  // Fetch the current soundtrack and time (polled every 30s)
  res.json({
    // Return current soundtrack and time as JSON for client polling
    soundtrack: currentSoundtrack,
    soundtrackTime: lastFetchedHour,
  });
});

app.post("/set-soundtrack", async (req, res) => {
  // Handle incoming request to change hourly soundtrack based on selected time by client
  const selectedTime = req.body.setTime; // Output eg.: 12 am
  const selectedGame = req.body.setGame; // Output are values 0-3
  console.log(`You are changing the time to ${selectedTime}`);

  if (selectedTime && selectedGame) {
    try {
      const result = await axios.get(`${baseURL}api/?time=${selectedTime}`);
      const wantedSoundtrack = result.data.music[selectedGame].file;

      // Update global variables:
      lastFetchedHour = req.body.setTime;
      currentSoundtrack = wantedSoundtrack;
      gameIndex = selectedGame;
      gameTitle = result.data.music[selectedGame].game;

      // Redirect to homepage with manual override flag
      res.redirect(`/?manual=true&time=${encodeURIComponent(selectedTime)}`); // encodeURIComponent() makes sure special characters (like AM, PM) in the time string are safely included in the URL
    } catch (error) {
      console.error("Error fetching manual soundtrack: ", error.message);
      res.render("index.ejs", {
        message: "Unable to fetch the requested soundtrack. Try again later.",
        soundtrack: null,
        soundtrackTime: selectedTime,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
