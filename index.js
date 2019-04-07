"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var fs = require("fs");
var express = require("express");
var session = require("express-session");
var sass = require("sass");
var pug = require("pug");
var mongodb_1 = require("mongodb");
var bcrypt = require("bcrypt");
// Get several paths
var res_path = __dirname + "/res"; // Folder for html files and such
var views_path = __dirname + "/views"; // Folder for Pug templates
var styles_path = __dirname + "/styles"; // Folder for Sass templates
// Mongo Client
var config = JSON.parse(fs.readFileSync("config.json", { encoding: "utf-8" }));
var db_name = config.db;
var db_url = "mongodb://" +
    config.admin.user +
    ":" +
    config.admin.pwd +
    "@localhost:27017/" +
    db_name;
console.log(db_url);
// Compile Sass
var sass_files = ["main", "aboutme", "projects"];
sass_files.forEach(function (e) {
    var result = sass.renderSync({
        file: styles_path + "/" + e + ".sass"
    });
    fs.writeFileSync(res_path + "/css/" + e + ".css", result.css);
});
// Get Pug template engine
var default_views = {
    index: pug.compileFile(views_path + "/index.pug")({}),
    about_me: pug.compileFile(views_path + "/aboutme.pug")({}),
    projects: pug.compileFile(views_path + "/projects.pug")({
        list: [
            {
                name: "Dia",
                img: "/imgs/portrait.jpg",
                description: "dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
                link: "/aboutme"
            },
            {
                name: "Dia",
                img: "/imgs/portrait.jpg",
                description: "dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
                link: "/aboutme"
            }
        ]
    }),
    404: pug.compileFile(views_path + "/404.pug", {}),
    signin: pug.compileFile(views_path + "/signin.pug", {})
};
// Express Declaration and Middleware
var app = express();
app.use("/", express.static(__dirname + "/res"));
// Set template engine
app.set("view engine", "pug");
app.set("views", views_path);
app.use(function (req, res, next) {
    sass_files.forEach(function (e) {
        var result = sass.renderSync({
            file: styles_path + "/" + e + ".sass"
        });
        fs.writeFileSync(res_path + "/css/" + e + ".css", result.css);
    });
    next();
});
// session
var MongoDBStore = require("connect-mongodb-session")(session);
var store = new MongoDBStore({
    uri: db_url,
    databaseName: db_name,
    collection: config.session.collection
});
app.set("trust proxy", 1); // trust first proxy
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    store: store
}));
// Body parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongodb_1.MongoClient.connect(db_url, { useNewUrlParser: true }, function (err, client) {
    if (err)
        throw err;
    var projects = client.db(db_name).collection("projects");
    var users = client.db(db_name).collection("users");
    // HTTP requests
    app.get("/", function (req, res) {
        // res.status(200);
        // res.send(default_views.index);
        res.render("index", {});
    });
    app.get("/aboutme", function (req, res) {
        // res.status(200);
        // res.send(default_views.index);
        res.render("aboutme", {});
    });
    app.get("/projects", function (req, res) {
        res.render("projects", {
            list: [
                {
                    name: "Dia",
                    img: "/imgs/portrait.jpg",
                    description: "dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
                    link: "/aboutme"
                },
                {
                    name: "Dia",
                    img: "/imgs/portrait.jpg",
                    description: "dasd asd dsad efe qwdef asdf awdef w dwdad feadw dwad awdwd2ds awdwfa wdw3qew fasdasd dsadwedwqdwqdsad qwe ewqd qwdwqe dwqdqw",
                    link: "/aboutme"
                }
            ]
        });
    });
    app.get("/signin", function (req, res) {
        res.render("signin", {});
    });
    app.post("/signin", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var user_doc, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check to see if there are the required fields
                    if (!req.body.user && !req.body.pwd) {
                        res.status(401);
                        res.render("signin", { error: "No given username or password" });
                    }
                    return [4 /*yield*/, users.findOne({ user: req.body.user })];
                case 1:
                    user_doc = _a.sent();
                    // Check if it exists
                    if (!user_doc) {
                        res.render("signin", { error: "Incorrect username or password" });
                        return [2 /*return*/];
                    }
                    hash = user_doc.pwd;
                    return [4 /*yield*/, bcrypt.compare(req.body.pwd, hash)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, users.updateOne(user_doc, {
                            $set: { session: req.session.sessionID }
                        })];
                case 3:
                    _a.sent();
                    res.render("signin", { error: "Login Successful" });
                    return [3 /*break*/, 5];
                case 4:
                    res.render("signin", { error: "Incorrect username or password" });
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); });
    app.get("/signup", function (req, res) {
        res.render("signup", {});
    });
    app.post("/signup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var exist, pwd, ins, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.body.pwd)
                        return [2 /*return*/, res.render('signup', { error: "No password given" })];
                    if (!req.body.user)
                        return [2 /*return*/, res.render('signup', { error: "No username given" })];
                    if (!req.body.email)
                        return [2 /*return*/, res.render('signup', { error: "No email given" })];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, users.findOne({ user: req.body.user })];
                case 2:
                    exist = _a.sent();
                    if (exist)
                        return [2 /*return*/, res.render('signup', { error: "Username taken" })];
                    return [4 /*yield*/, users.findOne({ email: req.body.email })];
                case 3:
                    exist = _a.sent();
                    if (exist)
                        return [2 /*return*/, res.render('signup', { error: "Email in use" })];
                    return [4 /*yield*/, bcrypt.hash(req.body.pwd, config.pwd.salt_rounds)];
                case 4:
                    pwd = _a.sent();
                    ins = {
                        user: req.body.user,
                        pwd: pwd,
                        email: req.body.email
                    };
                    return [4 /*yield*/, users.insertOne(ins)];
                case 5:
                    _a.sent();
                    res.render('signup', { error: "Signup successful" });
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.log(err_1);
                    res.status(500);
                    res.render('signup', { error: "There was a server error" });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    app.get("/projects/add", function (req, res) {
        res.redirect("/signin");
    });
    app.get("*", function (req, res) {
        res.render("404", {});
    });
    // Start Listening
    app.listen(process.env.port || 80, function () { return console.log("Listening..."); });
});
