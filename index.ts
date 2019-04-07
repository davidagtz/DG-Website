import * as fs from "fs";
import * as express from "express";
import * as session from "express-session";
import * as sass from "sass";
import * as pug from "pug";
import { MongoClient } from "mongodb";
import * as bcrypt from "bcrypt";

// Get several paths
const res_path = __dirname + "/res"; // Folder for html files and such
const views_path = __dirname + "/views"; // Folder for Pug templates
const styles_path = __dirname + "/styles"; // Folder for Sass templates

// Mongo Client
const config = JSON.parse(
	fs.readFileSync("config.json", { encoding: "utf-8" })
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
app.use("/", express.static(__dirname + "/res"));
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
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true },
		store: store
	})
);
interface Account {
	user: string,
	email: string,
	pwd: string
}

// Body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect(db_url, { useNewUrlParser: true }, (err, client) => {
	if (err) throw err;

	let projects = client.db(db_name).collection("projects");
	let users = client.db(db_name).collection("users");

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
			]
		});
	});

	app.get("/signin", (req, res) => {
		res.render("signin", {});
	});

	app.post("/signin", async (req, res) => {
		// Check to see if there are the required fields
		if (!req.body.user && !req.body.pwd) {
			res.status(401);
			res.render("signin", { error: "No given username or password" });
		}

		// Find the account in question
		let user_doc = await users.findOne({ user: req.body.user });
		// Check if it exists
		if (!user_doc) {
			res.render("signin", { error: "Incorrect username or password" });
			return;
		}
		// Get the hashed password and compare
		const hash = user_doc.pwd;
		if (await bcrypt.compare(req.body.pwd, hash)) {
			await users.updateOne(user_doc, {
				$set: { session: req.session.sessionID }
			});
			res.render("signin", { error: "Login Successful" });
		} else res.render("signin", { error: "Incorrect username or password" });
	});

	app.get("/signup", (req, res) => {
		res.render("signup", {});
	});

	app.post("/signup", async (req, res) => {
		if (!req.body.pwd)
			return res.render('signup', { error: "No password given" });
		if (!req.body.user)
			return res.render('signup', { error: "No username given" });
		if (!req.body.email)
			return res.render('signup', { error: "No email given" });
		try {
			let exist = await users.findOne({ user: req.body.user });
			if (exist)
				return res.render('signup', { error: "Username taken" });
			exist = await users.findOne({ email: req.body.email });
			if (exist)
				return res.render('signup', { error: "Email in use" });

			let pwd = await bcrypt.hash(req.body.pwd, config.pwd.salt_rounds);
			let ins: Account = {
				user: req.body.user,
				pwd: pwd,
				email: req.body.email
			};
			await users.insertOne(ins);
			res.render('signup', { error: "Signup successful" });
		} catch (err) {
			console.log(err);
			res.status(500);
			res.render('signup', { error: "There was a server error" });
		}
	});

	app.get("/projects/add", (req, res) => {
		res.redirect("/signin");
	});

	app.get("*", (req, res) => {
		res.render("404", {});
	});

	// Start Listening
	app.listen(process.env.port || 80, () => console.log("Listening..."));
});
