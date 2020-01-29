const bodyParser = require("body-parser")
const path = require("path")
const express = require("express")

const un = "admin";
const pw = "123456789";
const dbName = "alice"
const viewUrl = "_all_docs?include_docs=true"
const db_url = "http://" + un + ":" + pw + "@localhost:5984";
const nano = require('nano')(db_url);

const alice = nano.db.use(dbName);

// nano.uuids().then((ids) => {
// 	alice.insert({ username: un, password: pw }, ids[0]).then((body) => {
// 		console.log("Admin account added")
// 	});
// });

const app = express()

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.get('/', function(req, res) {
	alice.list().then(
		function(doc) {
			let temp = []
			let count = 0;
			for(var acc of doc.rows) {
				alice.get(acc.id).then((body) => {
				 	temp.push(body);
				 	count++;

				}).then((body) => {
					if(count == doc.rows.length) {
						res.render("index", {
							accounts: temp
						})
					}
				});
			}
		},
		function(err) {
			res.send(err);
		}
	)
})

app.post("/account/add", function(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	nano.uuids().then(function(ids) {
		const id = ids[0];
		alice.insert({
			_id: id,
			username: username, 
			password: password,
			test: "testing"
		}, id).then(
			function(body){
				res.redirect('/')
			},
			function(err){
				res.send(err);
			})
	});
})

app.listen(3000, function() {
	console.log("Server started on port 3000")
})