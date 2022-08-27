var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
const { Int32 } = require('mongodb');
const sequencing = require('../config/sequencing');

var userSchema = new Schema({
    _id: Number,
    username:{
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    profilepicture: {
        type: String,
        require: true,
    },
    isArtist: {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', function(next){
    var user = this;
    if(this.isModified('password') || this.isNew){
        bcrypt.genSalt(10, function(err,salt){
            if(err){
                return next(err)
            }
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err){
                    return next(err)
                }
                user.password = hash;
                sequencing.getSequenceNextValue("user_id").
                then(counter => {
                    if(!counter){
                        sequencing.insertCounter("user_id")
                        .then(counter =>{
                            user._id = counter;
                            next();
                        })
                        .catch(error => next(error))
                    }else{
                        user._id = counter;
                        next();
                    }
                })
                .catch(error => next(error))
            })
        })
    }
    else{
        return next()
    }
})

userSchema.methods.comparePassword = function(passw, cb){
    bcrypt.compare(passw, this.password, function(err, isMatch){
        if(err){
            return cb(err)
        }
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('User', userSchema)