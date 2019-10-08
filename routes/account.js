var fs = require('fs');
var User = require('../public/javascripts/user');
var Comments=require('../routes/comments');
var Votes=require('../routes/votes');
var Posts=require('../routes/posts');
module.exports={
    index:(req,res,next)=>{
        let re=[];

            Posts.find({},function(err,result){

                //if(err) throw err;
                if(err){
                    var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);
                }
                if(!result) message = "Post not found!";
                else {

                    re=result;
                    if(req.session.userId) {

                        User.findById(req.session.userId).exec(function (error,user) {
                            if(error){
                            var mess="Problem in server.Try again later";
                            res.redirect('/error/'+mess);}
                            else {
                                if (user == null) {
                                    var mess="Not authorized. Go back";
                                    res.redirect('/error/'+mess);
                                }
                                else {

                                    res.render('after.ejs', {uname: user.uname,arr:re});
                                }
                            }
                        });
                    }
                    else{

                        res.render('index.ejs',{arr:re});
                    }
                }
            });


    },
    SignPage:(req,res)=>{
        res.render('signup.ejs');

    },

    Sign:(req,res,next)=>{

        if (req.body.pwd !== req.body.cpwd) {
            var mess="Passwords do not match.Try again";
            return res.redirect('/error/'+mess);
        }

        if (req.body.fname &&
            req.body.email &&
            req.body.uname &&
            req.body.pwd &&
            req.body.cpwd) {

            var userData = {
                fname:req.body.fname,
                email: req.body.email,
                uname: req.body.uname,
                pwd: req.body.pwd,
            };

            User.create(userData, function (error, user) {
                if (error) {
                    var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);
                } else {
                    req.session.userId = user._id;
                     return  res.redirect('/');

                }
            });

        }
    },
    loginpage:(req,res)=>{
        res.render('login.ejs');
    },
    login:(req,res,next)=>{
    if (req.body.uname && req.body.pwd) {
            User.authenticate(req.body.uname, req.body.pwd, function (error, user) {
                if (error || !user) {

                    var mess="Wrong email or password";
                    res.redirect('/error/'+mess);

                } else {
                    req.session.userId = user._id;
                    var redirectTo =req.session.redirectTo || '/';
                    delete req.session.redirectTo;
                    return res.redirect(redirectTo);
                }
            });
        }
    },

    Createpage:(req,res,next)=>{
        let message = '';
        if(req.method === "POST"){
            var post  = req.body;
            var ctitle= post.ctitle;
            var desc= post.desc;
            var author= post.author;


            if (!req.files)
            {
                var mess="Image file not uploaded";
                return res.redirect('/error/'+mess);
            }

            var file = req.files.uploaded_image;
            var img_name=file.name;

            if(file.mimetype === "image/jpeg" ||file.mimetype === "image/png"||file.mimetype === "image/gif" ){

                file.mv('public/images/upload_images/'+file.name, function(err) {

                    if (err)

                    {var mess="Some problem occured.Try again";
                        res.redirect('/error/'+mess);}
                        var post1=new Posts({ctitle:ctitle,image:img_name, desc:desc, author:author});

                      post1.save(function(err2,res2){
                            if (err2) throw err2;
                            else{if(err){var mess="Problem in server.Try again later";
                                res.redirect('/error/'+mess);}
                            else {
                                var vote=new Votes({posttitle:ctitle,upvoters:[],downvoters:[],voteCount:0});
                                vote.save(function (err1,res1) {
                                    if (err1) throw err1;
                                    else {}
                                });
                                res.redirect('/showpost/' + ctitle);
                            }}

                        })

                });
            } else {
                message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                res.render('createform.ejs',{message: message,uname:""});
            }
        } else {
            User.findById(req.session.userId).exec(function (error,user) {
                if(error) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                else{
                    if (user==null){
                        res.redirect('/login');
                    }
                    else{

                        res.render('createform.ejs',{message:"",uname:user.uname});
                    }
                }
            });

        }
    },
    editpage:(req,res,next)=>{
        var blog={};
        var title=req.params.head;
        var query={ctitle:title};

            Posts.find(query,function (error,result) {
                if(result.length ===0){
                    //console.log("dsf");
                    var mess="No post with this title";
                    return res.redirect('/error/'+mess);

                }
                else
                    blog=result[0];
            });
        if(req.method === "POST") {

            var post = req.body;
            var ctitle = post.ctitle;
            var desc = post.desc;
            var author = post.author;

            if (!req.files) {

                var mess="No files were uploaded.Try again";
                return res.redirect('/error/'+mess);
            }
            var file = req.files.uploaded_image;
            var img_name = file.name;

            if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/gif") {

                file.mv('public/images/upload_images/' + file.name, function (err) {

                    if (err)
                    {var mess="Problem in server.Try again later";
                        res.redirect('/error/'+mess);}


                        Posts.update({ctitle:title},{$set:{
                            ctitle: ctitle,
                            image: img_name,
                            desc: desc,
                            author: author
                        }}, (err, result) => {
                            if (err) {var mess="Problem in server.Try again later";
                                res.redirect('/error/'+mess);}
                             else
                                res.redirect('/showpost/'+ctitle);
                        })

                });
            } else {
                message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
                //console.log(blog);
                var blog1={
                    ctitle:ctitle,
                    desc:desc,
                    author:author
                };
                res.render('editform.ejs', {message: message, blog:blog1});
            }
        }else {
            User.findById(req.session.userId).exec(function (error,user) {
                if(error) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                else{
                    if (user==null){
                        res.redirect('/login');
                    }
                    else{
                        if(user.uname!== blog.author){
                            var mess="You can edit only your posts";
                            return res.redirect('/error/'+mess);

                        }
                        else
                        res.render('editform.ejs',{message:"",blog:blog});

                    }
                }
            });

        }
    },

    logout:(req,res,next)=>{
        if (req.session) {
            // delete session object
            req.session.destroy(function (err) {
                if (err) {
                    var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);
                } else {
                    return res.redirect('/');
                }
            });
        }
    },

    show:(req,res)=>{
        let uname="";
        let bmarray=[];
        if(req.session.userId) {

            User.findById(req.session.userId).exec(function (error,user) {
                if (error) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                else {
                    if (user == null) {

                    }
                    else {
                        bmarray=user.bookmarks;

                        uname=user.uname;
                    }
                }
            });
        }
        else{

        }

        var head=req.params.head;
            var arri=[];


            var query={ctitle:head};
            Posts.find(query,function(err,result){


                if(err) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                if(!result) message = "Post not found!";
                else {
                    Posts.find({},function (err,arr) {
                        arri=arr;

                    res.render('blog.ejs', {item: result,uname:uname,arr:arri,bmarray:bmarray,bm:0});
                    });
                }
            });

    },
    showby:(req,res)=>{
        let uname = "";
        let bmarray = [];
        if(req.session.userId) {

            User.findById(req.session.userId).exec(function (error,user) {
                if (error) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                else {
                    if (user == null) {

                    }
                    else {
                        bmarray=user.bookmarks;
                        uname=user.uname;
                    }
                }
            });
        }
        else{

        }
        var by=req.params.author;
          var arri=[];
            Posts.find({},function (err,arr) {
                arri=arr;
            });
            var query={author:by};
            Posts.find(query,function(err,result){


                if(err) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                if(!result) message = "Post not found!";
                else {
                    //console.log(result);
                    res.render('blog.ejs', {item: result,uname:uname,arr:arri,bmarray:bmarray,bm:0});
                }
            });


    },
    error:(req,res)=>{
        var uname="";
        var mess=req.params.error;
        if(req.session.userId) {

            User.findById(req.session.userId).exec(function (error,user){
                res.render('error.ejs',{mess:mess,uname:user.uname})
            });
        }
        else{

            res.render('error.ejs',{mess:mess,uname:""})
        }
    },
    makecomment:(req,res)=>{
        if(req.session.userId) {
             User.findById(req.session.userId).exec(function (err,user) {
                if(err){
                    var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                else {
                    if (user == null) {
                        var mess="Not authorized. Go back";
                        res.redirect('/error/'+mess);
                    }
                    else {
                        Comments.find({'postId':req.params.id}, function (err, comments) {
                           // console.log(comments[0]+" "+ req.params.id+" "+user.uname);
                            res.render('makecomment', {  comments: comments, postId: req.params.id ,username:user.uname});
                        });
                    }
                 }

            });
        }
        else{
            res.redirect('/login');
        }

    },
    bookmark:(req,res)=>{

             var title=req.params.id;
            User.update({"_id":req.session.userId},{$push:{
                    bookmarks:title
                }},function (err,result) {
                    res.redirect("/showbookmark");
            })

    },
    rembookmark:(req,res)=>{

        var title=req.params.id;
        User.update({"_id":req.session.userId},{$pull:{
                bookmarks:title
            }},function (err,result) {
            res.redirect("/showbookmark");
        })

    },
    showbm:(req,res)=>{
            var arri=[];
            Posts.find({},function (err,arr) {
                arri=arr;
            });
            var barray=[];
            var uname="";
            User.findOne({_id:req.session.userId},function (err,result) {
                barray=result.bookmarks;
                uname=result.uname;
                Posts.find({ctitle:{$in:barray}},function (error,result2) {
                    //console.log(result2);
                    res.render("blog.ejs",{item:result2,uname:uname,arr:arri,bmarray:barray,bm:1})
                })
            });



    },
    givevote:(req,res)=>{
        //console.log(req.body);
           var counterInc = 0;
            var voterType = null;
            var uname="";
            User.findById(req.session.userId).exec(function (error,user) {
                if (error) {var mess="Problem in server.Try again later";
                    res.redirect('/error/'+mess);}
                else {
                    if (user == null) {

                    }
                    else {
                        uname=user.uname;
                        function same() {
                            Votes.findOne({posttitle:req.body.id},function (error2,result2) {
                                if(error2) throw error2;
                                else {
                                    //console.log("below");
                                    //console.log(result2.voteCount);
                                    res.send(result2);
                                }
                            })
                        }
                        function same2() {
                            Votes.updateOne({"posttitle": req.body.id},{
                                $addToSet: {
                                    [voterType]: uname
                                }
                            }, (error,result) => {

                                if(result.nModified > 0){
                                    //console.log("above");
                                    Votes.updateOne({"posttitle": req.body.id},{
                                        $inc: {
                                            "voteCount": counterInc
                                        }
                                    },function (error1,result1) {
                                        same();
                                    });
                                }
                                else{
                                    Votes.findOne({posttitle:req.body.id},function (error2,result2) {
                                        if(error2) throw error2;
                                        else {
                                            //console.log("below");
                                            //console.log(result2.voteCount);
                                            res.send(result2);
                                        }
                                    })
                                }
                            });
                        }
                        if(req.body.voteType === ""){
                            Votes.updateOne({"posttitle": req.body.id},{
                                $pull: {
                                    "downvoters": uname
                                }
                            }, (error, result) => {
                                if(result.nModified > 0){
                                    Votes.updateOne({"posttitle": req.body.id},{
                                        $inc: {
                                            "voteCount": 1
                                        }
                                    },function (error1,result1) {
                                        same();
                                    });
                                }
                                else{
                                    Votes.updateOne({"posttitle": req.body.id},{
                                        $pull: {
                                            "upvoters":uname
                                        }
                                    }, (error, result) => {
                                        if(result.nModified > 0){
                                            Votes.updateOne({"posttitle": req.body.id},{
                                                $inc: {
                                                    "voteCount": -1
                                                }
                                            },function (error1,result1) {
                                                same();
                                            });
                                        }
                                        else{
                                            same()
                                        }
                                    });
                                }
                            });
                        }
                        if(req.body.voteType === "up"){
                            voterType = "upvoters";
                            Votes.updateOne({"posttitle": req.body.id},{
                                $pull: {
                                    "downvoters": uname
                                },
                            }, (error,result) => {
                                //console.log("in up"+result.nModified);
                                //console.log(JSON.stringify(result, null));

                                if(result.nModified > 0){
                                    counterInc = 2;
                                }
                                else{
                                    counterInc = 1;
                                }
                                same2();
                            });
                        }
                        if(req.body.voteType === "down"){
                            voterType = "downvoters";
                            Votes.updateOne({"posttitle": req.body.id},{
                                $pull: {
                                    "upvoters": uname
                                },
                            }, (error,result) => {
                                //console.log("in down"+result.result);
                                if(result.nModified > 0){

                                    counterInc = -2;
                                }
                                else{
                                    counterInc = -1;
                                }
                                same2();
                            });
                        }


                    }
                }
            });



    },
    getvote:(req,res)=>{
        var posttitle=req.body.id;
        var username="";
        var sres;
        var type;
        function votefind(username) {
            Votes.findOne({posttitle:posttitle},function (err,result) {
                //console.log(username);
                if(result.upvoters.indexOf(username)>=0){
                    type="up";
                }
                else if(result.downvoters.indexOf(username)>=0){
                    type="down";
                }
                else{
                    type="none";
                }
                sres={voteCount:result.voteCount,type:type};
                //console.log(sres.type);
                res.send(sres);
            })
        }
        if(req.session.userId) {
        User.findById(req.session.userId).exec(function (error,user){
                username=user.uname;
                votefind(username);
            });
        }
        else{
            Votes.findOne({posttitle:posttitle},function (err,result) {
                type="notauth";
                sres={voteCount:result.voteCount,type:type};
                res.send(sres);
            })
            }


    }
};