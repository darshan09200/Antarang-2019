
module.exports = function (app) {

	var admin = require("./sub-controllers/online_connect.js");

	const bodyParser = require('body-parser');

	const urlencodedParser = bodyParser.urlencoded({
		extended: false
	});

	// for cookie
	var options = {
		//maxAge: (20 * 60 * 60 * 1000), //20*60*60*1000 => 20 hours
		httpOnly: true,
		signed: true,
		path: '/'
	};

	var token = require('./sub-controllers/token.js')

	app.get("/view/:id", function (req, res) {
		var id = req.params.id;

		admin.verify_user(id)
			.then(function (pdata) {
				admin.event_data(id)
					.then(function (event_data) {
						var events_data = [];
						event_data.forEach(function (event) {
							events_data.push(event.data());
						});

						res.set('Cache-Control', 'public, max-age=31557600');
						res.render("view", {
							title: "ANTARANG - VIEW PARTICIPANTS",
							id: id,
							event_data: events_data
						});
					})
					.catch(function (err) {
						console.log(err)
						res.send("error")
					})
			})
			.catch(function (err) {
				console.log(err)
				res.send("error")
			})
	});

	app.post("/view", urlencodedParser, function (req, res) {
		var id = req.body.id;
		var state = req.body.state;
		var event_code = req.body.event_code;

		token_data = token.encrypt();

		admin.encrypt_fid(id, token_data.key)
			.then(function (data) {
				var fid = data;

				res.cookie("index", token_data.cipher, options); // cipher
				res.cookie("uid", token_data.token, options); // token      
				res.cookie("lock", token_data.key, options); // key
				res.cookie("init", JSON.stringify(token_data.iv), options); // iv
				res.cookie("fid", fid, options); // encrypted firebase id
				res.cookie("key", "0", options) //attempt

				admin.get_id(id)
					.then(function (uid) {
						res.cookie("key", "1", options) //attempt
						if(state === 'update'){
							res.redirect('/update/' + uid);
						}else{
							res.redirect('/view/' + uid);
						}
						
					})
					.catch(function () {
						res.cookie("key", "1", options) //attempt						
						res.redirect("/login");
					})

			})
			.catch(function () {
				res.cookie("key", "1", options) //attempt
				res.redirect("/login");
			});
	})

	app.post('/view/:id/:event_code', urlencodedParser, function (req, res) {
		var id = req.params.id;
		var event_code = req.params.event_code;
		admin.verify_user(id)
			.then(function (user_data) {
				admin.participant_data(id, event_code)
					.then(function (participants_data) {
						var participant_data = [];
						participants_data.forEach(function (participant) {
							participant_data.push(JSON.stringify(participant.data()));
						})
						res.send(participant_data);
					})
					.catch(function () {
						res.send("error")
					})
			})
			.catch(function (err) {
				console.log(err);
				res.send("error")
			})

	})
	app.get("/add/:id", function (req, res) {
		var id = req.params.id;

		admin.verify_user(id)
			.then(function (user_data) {
				admin.event_data(id)
					.then(function (event_data) {
						var events_data = [];
						event_data.forEach(function (event) {
							events_data.push(event.data());
						});
						res.set('Cache-Control', 'public, max-age=31557600');
						res.render("add", {
							title: "ANTARANG - ADD PARTICIPANTS",
							id: id,
							course_data: ['BSc.IT', 'BA'],
							course_div_data: {
								'BSc.IT': [2, 4, 3],
								'BA': [3, 2]
							},
							events_data: events_data
						});
					})
					.catch(function () {
						res.send("error")
					})
			})
			.catch(function (err) {
				console.log(err);
				res.send("error")
			})
	});

	app.post("/add-validate/:id", urlencodedParser, function (req, res) {
		var id = req.params.id;

		admin.verify_user(id)
			.then(function (user_data) {
				var data = JSON.parse(req.body.pdata);
				var state = req.body.state;
				var hacking = [
					'\"',
					'\'',
					'=',
					'<',
					'>',
					';',
					',',
					'script',
					'SCRIPT',
					' and ',
					' AND ',
					' or ',
					' OR ',
					' not ',
					' NOT ',
					'img',
					'src',
					'href',
					'|',
					'\\',
					'/',
					'&',
					'~',
					'`',
					'$'
				];

				var flag = false;
				for (var index = 0; index < hacking.length; index++) {
					for (var key in data) {
						if (data[key].indexOf(hacking[index]) >= 0) {
							console.log(data[key])
							flag = true;
						}
					}
				}
				if (flag) {
					res.send({
						pdata: data
					});
				} else {
					data["uid"] = req.params.id;
					if (state === 'add') {
						admin.add_data(data, state)
							.then(function () {
								res.send({
									state: "done"
								});
							})
							.catch(function (err) {
								if (err.indexOf("duplicate") > -1) {
									res.send({
										state: "duplicate"
									});
								} else if (err.indexOf("full") > -1) {
									res.send({
										state: "full"
									});
								} else {
									res.send({
										pdata: data,
										state: "error"
									});
								}
							})
					} else if (state === 'update') {
						admin.update_data(data)
							.then(function (data) {
								res.send({
									state: "done"
								})
							})
							.catch(function (err) {
								if (err.indexOf("duplicate") > -1) {
									res.send({
										state: "duplicate"
									});
								} else if (err.indexOf("unavailable") > -1) {
									res.send({
										state: "unavailable"
									});
								} else if (err.indexOf("full") > -1) {
									res.send({
										state: "full"
									});
								} else {
									res.send({
										pdata: data,
										state: "error"
									});
								}
							})
					} else {
						res.send({
							state: "unknown"
						});
					}
				}
			})
			.catch(function () {
				res.send({
					state: "unknown"
				});
			})
	})

	app.get("/update/:id", function (req, res) {
		var id = req.params.id;

		admin.verify_user(id)
			.then(function (user_data) {
				admin.event_data(id)
					.then(function (event_data) {
						var events_data = [];
						event_data.forEach(function (event) {
							events_data.push(event.data());
						});

						res.render("update", {
							title: "ANTARANG - UPDATE DETAILS",
							id: id,
							events_data: events_data
						});
					})
					.catch(function (err) {
						console.log(err);
						res.send("error");
					})
			})
			.catch(function (err) {
				console.log(err);
				res.send("error");
			})
	});

	app.post("/update/:id/:event_code", urlencodedParser, function (req, res) {
		var id = req.params.id;
		var event_code = req.params.event_code;
		admin.verify_user(id)
			.then(function (user_data) {
				var name = req.body.pname;
				var og_course = req.body.pcourse.split(" ");
				var year = og_course[0].substring(0, 2);
				var course = og_course[0].substring(2);
				var div = og_course[1];
				var roll_no = req.body.proll_no;
				var no = req.body.pno;				
				admin.get_user(id, event_code, name, course, div, year, roll_no)
					.then(function (pdata) {
						admin.event_data(id)
							.then(function (event_data) {
								var events_data = [];
								event_data.forEach(function (event) {
									events_data.push(event.data());
								});
								res.render("update-add", {
									title: "ANTARANG - UPDATE DETAILS",
									id: id,
									user_data: pdata,
									course_data: ['BSc.IT', 'BA'],
									course_div_data: {
										'BSc.IT': [2, 4, 3],
										'BA': [3, 2]
									},
									events_data: events_data
								})
							})
							.catch(function (err) {
								console.log(err);
								res.send("error");
							})
					})
					.catch(function (err) {
						console.log(err);
						res.send("error");
					})

			})
			.catch(function (err) {
				console.log(err);
				res.send("error");
			})
	});

	app.get("/delete/:id", function (req, res) {
		var id = req.params.id;

		admin.verify_user(id)
			.then(function (user_data) {
				res.render("delete", {
					title: "ANTARANG - DELETE DETAILS",
					id: id,
					event_data: event_data
				});
			})
			.catch(function (err) {
				console.log(err);
			})
	});

};