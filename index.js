// Get several paths
const fs = require("fs");
const res_path = __dirname + "/res"; // Folder for html files and such
const views_path = __dirname + "/views"; // Folder for Pug templates
const styles_path = __dirname + "/styles"; // Folder for Sass templates

// Mongo Client
const MongoClient = require("mongodb").MongoClient;
const config = JSON.parse(
	fs.readFileSync("config.json", { encoding: "utf-8" })
);
const db_url =
	"mongodb://" +
	config.admin.user +
	":" +
	config.admin.pwd +
	"@localhost:27017/DevWebsite";

console.log(db_url);

const db_name = "DevWebsite";

// Compile Sass
const sass = require("sass");
const sass_files = ["main", "aboutme"];
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
	index: pug.compileFile(views_path + "/index.pug")({}),
	about_me: pug.compileFile(views_path + "/aboutme.pug")({})
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

MongoClient.connect(db_url, { useNewUrlParser: true }, (err, client) => {
	if (err) throw err;

	// HTTP requests
	app.get("/", (req, res) => {
		// res.status(200);
		// res.send(default_views.index);
		res.render("index", {});
	});

	app.get("/aboutme", (req, res) => {
		// res.status(200);
		// res.send(default_views.index);
		res.render("aboutme", {});
	});

	// Start Listening
	app.listen(process.env.port || 80, () => console.log("Listening..."));
});
