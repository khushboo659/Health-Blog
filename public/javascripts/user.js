var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    uname: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    pwd: {
        type: String,
        required: true,
    },
    bookmarks:{
        type: Array
    }
});

//authenticate input against database
UserSchema.statics.authenticate = function (uname, pwd, callback) {
    User.findOne({ uname: uname })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(pwd, user.pwd, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.pwd, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.pwd = hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;