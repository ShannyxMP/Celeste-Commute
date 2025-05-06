import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

// Middlewares:
app.use(express.static("public")); // Handle static files

app.get("/", (req, res) => {
  console.log("You are on the homepage.");
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
