var express = require('express');
var app = express();

var path = require('path');

app.use(express.static(path.join(__dirname + '/public')));

//view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

var cookieParser = require('cookie-parser');

const helmet = require('helmet')

var loginController = require('./controllers/login.js');
var homeController = require('./controllers/home.js');
var linkController = require('./controllers/links.js');

app.use(helmet());

app.use(helmet.hidePoweredBy({
    setTo: 'PHP 4.2.0'
}));

app.use(cookieParser("Fooled you :)"));

var token = require('./controllers/sub-controllers/token.js')
var fb = require('./controllers/sub-controllers/online_connect.js')

var url = "http://127.0.0.1:3000"

var options = {
    // maxAge: (20 * 60 * 60 * 1000), //20*60*60*1000 => 20 hours
    httpOnly: true,
    signed: true,
    path: '/'
};

app.use(function (req, res, next) {

    console.log('%s %s', req.method, req.url);
    var cookie = req.signedCookies;

    var headers = req.headers
    if (!(("referer" in headers) && (headers.referer != ""))) {
        res.cookie("key", "0", options);
    }
    if ((req.originalUrl === '/login') || (req.originalUrl === '/validate') || (req.originalUrl === '/attempt')) {
        next();
    } else if (token.verification(cookie)) {
        fb.decrypt_fid(cookie.fid, cookie.lock)
            .then(function () {
                next();
            })
            .catch(function () {
                res.cookie("fid", "", options);
                res.redirect(url + '/login');
            })
    } else {
        res.cookie("fid", "");
        res.redirect(url + '/login');
    }
});

loginController(app);
homeController(app);
linkController(app);

// app.get('/', function (req, res) {
//     res.render("navbar");
// });


// app.get('/login', function (req, res) {
//     res.render("login");
// });

// app.post('/login', function (req, res) {

// })

// app.get('/register', function (req, res) {
//     res.render("register");
// });

app.listen(3000, function () {
    console.log("Port running on 3000");
})