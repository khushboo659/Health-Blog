var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var Posts = new Schema({
    ctitle :String,
    image :String,
    desc:String,
    author:String
});
module.exports = mongoose.model('Posts', Posts);