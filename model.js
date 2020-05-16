var mongoose=require('mongoose');

var UserSchema=mongoose.Schema({
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    address:{
        type: String,
        required:true
    },
    city:{
        type: String,
        required:true
    },
    state:{
        type: String,
        required:true
    },
    zip:{
        type: String,
        required:true
    }

});

module.exports=new mongoose.model('User',UserSchema);