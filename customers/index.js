const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const nodeCouchDb = require("node-couchdb")

const couch = new nodeCouchDb({
	auth: {
		user:"admin",
		password:"123456789"
	}
})

couch.listDatabases().then(function(dbs) {
	console.log(dbs);
})

const dbName = "mycompany"
const viewUrl = "_design/view_all/_view/customer"
/*
Create express app
Setup ejs template
Setup directory "views" to path name
Parse the JSON information and URL
Routing HTTP requests
Listens for connections on http://localhost:3000/
*/
const app = express()

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.get('/', function(req, res) {
	couch.get(dbName, viewUrl).then(
		function(data, headers, status){
			res.render("index", {
				customers: data.data.rows
			})
		},
		function(err) {
			res.send(err);
		}
		)
})

app.post("/customer/add", function(req, res) {
	const name = req.body.name;
	const email = req.body.email;

	couch.uniqid().then(function(ids) {
		const id = ids[0];
		couch.insert(dbName, {
			_id: id,
			name: name, 
			email: email
		}).then(
			function(data, headers, status){
				res.redirect('/')
			},
			function(err){
				res.send(err);
			})
	});
})

app.post("/customer/update/:id", function(req, res) {
	const newname = req.body.newname;
	const newemail = req.body.newemail;
	const id = req.params.id
	const rev = req.body.rev

	couch.update(dbName, { _id: id, _rev: rev, name: newname, email: newemail}).then(
		function(data, headers, status){
			res.redirect('/')
		},
		function(err){
			res.send(err);
		})
})


app.post("/customer/delete/:id", function(req, res) {
	const id = req.params.id
	const rev = req.body.rev
	couch.del(dbName, id, rev).then(
		function(data, headers, status){
			res.redirect('/')
		},
		function(err){
			res.send(err);
		})
})

app.listen(3000, function() {
	console.log("Server started on port 3000")
})