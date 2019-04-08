import * as express from "express";
import { Collection } from "mongodb";
import * as bcrypt from "bcrypt";
import { Account } from "./Types"

export default function (users: Collection<any>, config: any): express.Router {
	let app = express.Router();

	app.get("/", (req, res) => {
		res.render("account", { account: req.session.user })
	});

	app.post("/logout", (req, res) => {
		req.session.destroy(err => { if (err) throw err; });
		res.render("signin", { error: "Logout Successful" });
	});

	app.get("/signin", (req, res) => {
		res.render("signin", { account: req.session.user });
	});

	app.post("/signin", async (req, res) => {
		// Check to see if there are the required fields
		if (!req.body.user && !req.body.pwd) {
			res.status(401);
			res.render("signin", { error: "No given username or password", account: req.session.user });
		}

		// Find the account in question
		let user_doc = await users.findOne({ user: req.body.user });
		// Check if it exists
		if (!user_doc) {
			res.render("signin", { error: "Incorrect username or password", account: req.session.user });
			return;
		}
		// Get the hashed password and compare
		const hash = user_doc.pwd;
		if (await bcrypt.compare(req.body.pwd, hash)) {
			req.session.user = user_doc;
			req.session.save(err => { if (err) throw err; });
			console.log("Session saved");
			console.log(req.session);
			res.render("signin", { error: "Login Successful", account: req.session.user });
		} else res.render("signin", { error: "Incorrect username or password", account: req.session.user });
	});

	app.get("/signup", (req, res) => {
		res.render("signup", { account: req.session.user });
	});

	app.post("/signup", async (req, res) => {
		if (!req.body.pwd)
			return res.render('signup', { error: "No password given", account: req.session.user });
		if (!req.body.user)
			return res.render('signup', { error: "No username given", account: req.session.user });
		if (!req.body.email)
			return res.render('signup', { error: "No email given", account: req.session.user });
		try {
			let exist = await users.findOne({ user: req.body.user });
			if (exist)
				return res.render('signup', { error: "Username taken", account: req.session.user });
			exist = await users.findOne({ email: req.body.email });
			if (exist)
				return res.render('signup', { error: "Email in use", account: req.session.user });

			let pwd = await bcrypt.hash(req.body.pwd, config.pwd.salt_rounds);
			let ins: Account = {
				user: req.body.user,
				pwd: pwd,
				email: req.body.email
			};
			await users.insertOne(ins);
			res.render('signup', { error: "Signup successful", account: req.session.user });
		} catch (err) {
			console.log(err);
			res.status(500);
			res.render('signup', { error: "There was a server error", account: req.session.user });
		}
	});

	return app;
}