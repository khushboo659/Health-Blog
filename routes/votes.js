var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var Votes = new Schema({

    posttitle :String,
    upvoters:Array,
    downvoters:Array,
    voteCount:Number
});
module.exports = mongoose.model('Votes', Votes);