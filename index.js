const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoutes = require("./routes/url");
const URL = require("./models/url");
const path = require("path");
const staticRoute = require('./routes/staticRouter')

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);


// Server Side Rendering with EJS
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
// ssr
app.use(express.urlencoded({ extended: false }))

// just make router

// ex - just ssr example
// app.get("/test",async (req, res) => {
//   const allUrls = await URL.find({})
//   return res.render('home', {
//     urls: allUrls,
//   })
// });

app.use("/url", urlRoutes);
// ssr
app.use('/', staticRoute)

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Sever Started at PORT: ${PORT}`));
