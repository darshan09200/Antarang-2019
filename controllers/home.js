
module.exports = function (app) {

	var admin = require("./sub-controllers/online_connect.js");

	app.get("/home/:id", function (req, res) {
		var id = req.params.id;
		admin.verify_user(id)
			.then(function (user_data) {
				res.render("dashboard", {
					title: "ANTARANG - HOME",
					id: id
				});
			})
			.catch(function(err){
				console.log(err);
			})		
	});

};