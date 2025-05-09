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

// Update song every hour:
async function checkAndUpdateHour() {
  const hourNow = getCurrentHour();

  // [ ] Check if song updates on the next hour
  if (hourNow !== lastFetchedHour) {
    try {
      const result = await axios.get(`${baseURL}api/?time=${hourNow}`);
      currentSoundtrack = result.data.music[1].file; // Array: 0 -> for New Horizons; 1 -> New Leaf; 2 -> City Folk; 3 -> GameCube
      lastFetchedHour = hourNow;
    } catch (error) {
      console.error("API fetch error: ", error.message);
      currentSoundtrack: null;
    }
  }
}
setInterval(checkAndUpdateHour, 60000); // Check every minute
checkAndUpdateHour(); // Run once at startup

// Middlewares:
app.use(express.static("public")); // Handle static files

// Route(s):
app.get("/", async (req, res) => {
  // console.log("You are on the homepage.");
  res.render("index.ejs", {
    message: currentSoundtrack ? null : "Unable to retrieve file.",
    soundtrack: currentSoundtrack,
    time: lastFetchedHour,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
