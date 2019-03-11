// Get several paths
const fs = require("fs");
let index_path = fs.realpathSync(".", { encoding: "utf8" }); // Path to this directory
const res_path = index_path + "/res"; // Folder for html files and such
const views_path = index_path + "/views"; // Folder for Pug templates
const styles_path = index_path + "/styles"; // Folder for Sass templates

// Compile Sass
const sass = require("sass");
const sass_files = ["main"];
sass_files.forEach(e => {
  let result = sass.renderSync({
    file: styles_path + "/" + e + ".sass"
  });
  if (result.err) throw result.err;
  fs.writeFileSync(res_path + "/css/" + e + ".css", result.css);
});

// Get Pug template engine
const pug = require("pug");
let default_views = {
  index: pug.compileFile(views_path + "/index.pug")({})
};

// Express Declaration and Middleware
let express = require("express");
let app = express();
app.use("/", express.static(__dirname + "/res"));
// Set template engine
app.set("view engine", "pug");
app.set("views", views_path);
app.use((req, res, next) => {
  sass_files.forEach(e => {
    let result = sass.renderSync({
      file: styles_path + "/" + e + ".sass"
    });
    if (result.err) throw result.err;
    fs.writeFileSync(res_path + "/css/" + e + ".css", result.css);
  });
  next();
});

// HTTP requests
app.get("/", (req, res) => {
  // res.status(200);
  // res.send(default_views.index);
  res.render("index", {});
});

// Start Listening
app.listen(process.env.port || 80, () => console.log("Listening..."));
