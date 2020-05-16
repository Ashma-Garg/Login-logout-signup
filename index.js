var express=require('express'),
    ejs=require('ejs'),
    routes=require('./route.js'),
    path=require('path');
var app=express();

// app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.get('/',routes);
app.post('/',routes);
app.get('/login',routes);
app.post('/login',routes);
app.get('/success',routes);
app.get('/logout',routes);
app.listen(process.env.PORT|| 8088, process.env.ID,function(req,res){
    console.log("Server started");
});

