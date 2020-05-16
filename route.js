var express=require('express'),
    routes=express.Router(),
    mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    User=require('./model.js'),
    bcrypt=require('bcryptjs'),
    methodOverride=require('method-override'),
    passport=require('passport'),
    localStrategy=require('passport-local').Strategy,
    session=require('express-session'), // it is needed for passport session
    cookieParser=require('cookie-parser'),  // for passport
    flash=require('connect-flash');

routes.use(bodyParser.urlencoded({extended:true}));

// this portion is to be written before initialising the passport{
routes.use(cookieParser('secret'));
routes.use(session({
    secret: 'secret',
    maxAge: 3600000,  // user can be logged in for 2 week (cookies will be preserved for 2 week)
    resave: true,
    saveUninitialized: true,
}));
//}


routes.use(passport.initialize());
routes.use(passport.session());

routes.use(flash());

//global variable

routes.use(function(req,res,next){
    res.locals.success_message= req.flash('success_message'),
    res.locals.error_message=req.flash('error_message'),
    res.locals.error=req.flash('error'), // pehle se defined h flash me kyuki jo hme error milega vo isi k through milega
    next(); // agr ye nhi likhenge to hmaara code aage jayega hi hi.. vahi ruk jaayega
});

var checkAuthenticated=function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache,privete,no-store,must-revalidate,post-check=0,pre-checked=0');
        return next();
    }
    else{
        res.redirect('/login');
    }
}

// end of global variables (Middleaes)

var url="mongodb://localhost/mylogin";
mongoose.connect(url,{useUnifiedTopology: true,useNewUrlParser:true}).then(()=>{
    console.log("DataBase Connected");
});

// User.remove({},(err)=>{
//     if(err) throw err;
//     console.log("delete");
// });
routes.get('/',(req,res)=>{
    User.find({},(err,data)=>{
        console.log(data);
    });

    res.render('register');
});
routes.post('/',(req,res)=>{
    // var confrm={
    //     email:req.body.email,
    //     password:req.body.password,
    //     cpassword:req.body.cpassword,
    //     address:req.body.address,
    //     city:req.body.city,
    //     state:req.body.state,
    //     zip:req.body.zip
    // };
    var {email,password,cpassword,address,city,state,zip}=req.body;
    var err;
    if(!email || !password || !cpassword || !address || !city || !state || !zip){
        err="Fill Each field!";
        res.render('register',{err:err});
    }
    if(password!=cpassword){
        err="Password Does Not Match.";
        res.render('register',{err:err, email:email, city:city, address:address, state:state, zip:zip});
    }
    if(typeof err=='undefined'){
        User.findOne({email:email},(err,data)=>{
            if(err){ console.log(err);}
            if(data){
                err="Data already exist.";
                res.render('register',{err:err});
            }
            else{
                bcrypt.genSalt(10, (err,salt)=>{
                    if(err){ console.log(err);}
                    bcrypt.hash(password, salt, (err,hash)=>{
                        if(err){ console.log(err);}
                        password=hash;
                    User({
                        email:email,
                        password:password,
                        address:address,
                        city:city,
                        state:state,
                        zip:zip
                    }).save((err,data)=>{
                        if(err){ console.log(err);}
                        req.flash('success_message',"Registered successfully... Login to continue!");
                        res.redirect('/login');
                    });
                });
                });
            }
        });
    }
});

// authentication strategy starts from here
passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
    User.findOne({email:email},(err,data)=>{
        if(err) throw err;
        if(!data){
            return done(null, false, {message:"Email is not Registered."});
        }
        bcrypt.compare(password,data.password,(err,match)=>{
            if(err){
                return done(null,false);
            }
            if(!match){
                return done(null,false, {message:"Invalid email or password."});
            }
            if(match){
                return done(null,data);
            }
        });
    });
}));

passport.serializeUser(function(User,cb){
    cb(null,User.id);
});
passport.deserializeUser(function(id,cb){
    User.findById(id,function(err,User){
        cb(err,User);
    });
});

// authentication strategy ends here


routes.get('/login',(req,res)=>{
    res.render('login');
});
routes.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect: '/login',
        successRedirect: '/success',
        failureFlash: true,
    })(req,res,next);
});

routes.get('/success',checkAuthenticated,(req,res)=>{
    // console.log(req.user);
    res.render('success',{user:req.user});
});

routes.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
});
module.exports=routes;