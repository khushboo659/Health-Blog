var User = require('./public/javascripts/user');
var Comments=require('./routes/comments');
var fs=require('fs');
var express=require("express");
var bodyParser=require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false});
var fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const path = require('path');
const {index,SignPage,Sign,Createpage,editpage,show,logout,loginpage,login,showby,error,makecomment,bookmark,rembookmark,showbm,givevote,getvote}=require('./routes/account');
var app=express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.port || 3001;

var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//connect to MongoDB
mongoose.connect('mongodb://localhost:27017/problog');
var db1 = mongoose.connection;

//handle mongo error
db1.on('error', console.error.bind(console, 'connection error:'));
db1.once('open', function () {
    // we're connected!
});

app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db1
    })
}));
function isAuth(req,res,next){
    if(!req.session.userId){
        req.session.redirectTo =req.path;
        res.redirect('/login');
    }else{
        next();
    }
}

const client = new MongoClient(url);
const connection = client.connect();
global.client=client;
global.connection=connection;
app.set('view engine','ejs');
app.use('/',express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(urlencodedParser);
app.get('/',index);
app.get('/signUp',SignPage);
app.post('/signUp',Sign);
app.get('/login',loginpage);
app.post('/login',login);
app.get('/createblog',Createpage);
app.post('/createblog',Createpage);

app.get('/showpost/:head',show);
app.get('/editpost/:head',editpage);
app.post('/editpost/:head',editpage);
app.get('/by/:author',showby);
app.get('/logout',logout);
app.get('/error/:error',error);
app.get('/user/delete', function(req, res){
    User.remove(
        function(err, docs){
            if(err) res.json(err);
            else    res.redirect('/');
        });
});
app.get('/comment/:id',makecomment);
app.get('/bookmark/:id',isAuth,bookmark);
app.get('/removebookmark/:id',isAuth,rembookmark);
app.get('/showbookmark',isAuth,showbm);
app.post('/givevote',isAuth,givevote);
app.post('/getvote',getvote);
app.get('*',function (req,res) {
    console.log(req.path);
   res.redirect('/error/'+"cannot find path")
});

io.on('connection',function(socket){
    socket.on('comment',function(data){
        var commentData = new Comments(data);
        commentData.save();
        //console.log("io"+data);
        socket.broadcast.emit('comment',data);
    });

});
http.listen(port,function(){
    console.log("Server running at port "+ port);
});
//app.listen(3001);