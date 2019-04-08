import * as fs from "fs";
import * as express from "express";
import * as session from "express-session";
import * as sass from "sass";
import * as pug from "pug";
import { MongoClient } from "mongodb";
import * as bcrypt from "bcrypt";
import account_app from "./routes/Account";

// Get several paths
const res_path = __dirname + "/../res"; // Folder for html files and such
const views_path = __dirname + "/../views"; // Folder for Pug templates
const styles_path = __dirname + "/../styles"; // Folder for Sass templates

// Mongo Client
const config = JSON.parse(
	fs.readFileSync(__dirname + "/../config.json", { encoding: "utf-8" })
);
const db_name: string = config.db;
const db_url =
	"mongodb://" +
	config.admin.user +
	":" +
	config.admin.pwd +
	"@localhost:27017/" +
	db_name;

console.log(db_url);

// Compile Sass
const sass_files = ["main", "aboutme", "projects"];
sass_files.forEach(e => {
	let result = sass.renderSync({
		file: styles_path + "/" + e + ".sass"
	});
	fs.writeFileSync(res_path + "/css/" + e + ".css", result.css);
});

// Get Pug template engine
let default_views = {
	index: pug.compileFile(views_path + "/index.pug")({}),
	about_me: pug.compileFile(views_path + "/aboutme.pug")({}),
	projects: pug.compileFile(views_path + "/projects.pug")({
		list: [
			{
				name: "Dia",
				img: "/imgs/portrait.jpg",
				description:
					"dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
				link: "/aboutme"
			},
			{
				name: "Dia",
				img: "/imgs/portrait.jpg",
				description:
					"dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
				link: "/aboutme"
			}
		]
	}),
	404: pug.compileFile(views_path + "/404.pug", {}),
	signin: pug.compileFile(views_path + "/signin.pug", {})
};

// Express Declaration and Middleware
let app = express();
app.use("/", express.static(__dirname + "/../res"));
// Set template engine
app.set("view engine", "pug");
app.set("views", views_path);
app.use((req, res, next) => {
	sass_files.forEach(e => {
		let result = sass.renderSync({
			file: styles_path + "/" + e + ".sass"
		});
		fs.writeFileSync(res_path + "/css/" + e + ".css", result.css);
	});
	next();
});
// session
let MongoDBStore = require("connect-mongodb-session")(session);
let store = new MongoDBStore({
	uri: db_url,
	databaseName: db_name,
	collection: config.session.collection
});
app.set("trust proxy", 1); // trust first proxy
app.use(
	session({
		secret: config.session.secret,
		resave: true,
		saveUninitialized: false,
		// cookie: { secure: true },
		store: store
	})
);

// Body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect(db_url, { useNewUrlParser: true }, (err, client) => {
	if (err) throw err;

	let projects = client.db(db_name).collection("projects");
	let users = client.db(db_name).collection("users");

	// HTTP requests
	app.get("/", async (req, res) => {
		res.render("index", { account: req.session.user });
	});

	app.get("/aboutme", (req, res) => {
		// res.status(200);
		// res.send(default_views.index);
		res.render("aboutme", { account: req.session.user });
	});

	app.use("/account", account_app(users, config));

	app.get("/projects", (req, res) => {
		res.render("projects", {
			list: [
				{
					name: "Dia",
					img: "/imgs/portrait.jpg",
					description:
						"dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
					link: "/aboutme"
				},
				{
					name: "Dia",
					img: "/imgs/portrait.jpg",
					description:
						"dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
					link: "/aboutme"
				}
			],
			account: req.session.user
		});
	});



	app.get("/projects/add", (req, res) => {
		res.redirect("/account/signin");
	});

	app.get("*", (req, res) => {
		res.render("404", { account: req.session.user });
	});

	// Start Listening
	app.listen(process.env.port || 80, () => console.log("Listening..."));
});
