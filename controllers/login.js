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

    // function checkInternet(cb) {
    //     require('dns').lookup('google.com', function (err) {
    //         if (err && err.code == "ENOTFOUND") {
    //             //console.log(err)  
    //             cb(false);

    //         } else {
    //             cb(true);
    //         }
    //     })
    // }

    // app.get("/checkOnline", function (req, res) {
    //     checkInternet(function (isConnected) {
    //         if (isConnected) {
    //             res.send("true")
    //         } else {
    //             res.send("false")
    //         }
    //     });
    // });

    app.post("/validate", urlencodedParser, function (req, res) {
        var email = req.body.email;
        var pwd = req.body.pwd;

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
        hacking.forEach(hackWord => {
            if (((email.indexOf(hackWord) > -1) || (pwd.indexOf(hackWord) > -1))) {
                flag = true;
                email = "";
                pwd = "";
                return;
            }
        });

        if (!flag) {
            res.send({
                email: email + ".oops",
                pwd: pwd + ".oops"
            });
        } else {
            res.send({
                email: email,
                pwd: pwd
            });
        }

    })

    function attempt_verify(header_data, cookie) {
        var attempt = 0;
        if (!(JSON.stringify(cookie) === '{}')) {
            if (("key" in cookie)) {
                if ((cookie.key != "")) {
                    req_attempt = parseInt(cookie.key);
                    if ((typeof req_attempt) == "number") {
                        attempt = req_attempt + 1;

                    } else {
                        attempt = 4;
                    }
                } else {
                    attempt = 4;
                }
            }
        }
        return attempt;
    }

    app.get("/attempt", function (req, res) {
        var attempt = attempt_verify(req.header, req.signedCookies)
        res.cookie("key", attempt, options) //attempt
        console.log(attempt)
        console.log("example@1234.com,123456789");
        res.send(attempt.toString());
    })
    //GET home page.
    app.get("/login", function (req, res) {
        var attempt = attempt_verify(req.header, req.signedCookies)
        console.log(attempt);
        res.render("login", {
            title: "ANTARANG - LOGIN",
            attempt: attempt,
        });
    });

    app.post('/login', urlencodedParser, function (req, res) {

        var attempt = attempt_verify(req.header, req.signedCookies)
        var id = req.body.id;

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
                        res.redirect('/home/' + uid);
                    })
                    .catch(function () {
                        res.cookie("key", attempt, options) //attempt
                        res.redirect("/login");
                    })

            })
            .catch(function () {
                res.cookie("key", attempt, options) //attempt
                res.redirect("/login");
            });

    });
};