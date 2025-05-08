import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const baseURL = "https://ac-api.vercel.app/";

const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit" }); // Output eg.: 06 PM

// Middlewares:
app.use(express.static("public")); // Handle static files

app.get("/", async (req, res) => {
  // console.log("You are on the homepage.");
  try {
    const result = await axios.get(`${baseURL}api/?time=${currentTime}`);
    res.render("index.ejs", {
      message: null,
      soundtrack: result.data.music[1].file, // Array: 0 -> for New Horizons; 1 -> New Leaf; 2 -> City Folk; 3 -> GameCube
    });
  } catch (error) {
    console.error(error.message);
    res.render("index.ejs", {
      message: "Unable to retrieve file.",
      soundtrack: null,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
