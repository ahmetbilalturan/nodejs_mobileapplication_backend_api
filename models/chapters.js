var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var chapterSchema = new Schema({
    mangaID:{
        type: Number,
        required: true,
    },
    chapterID:{
        type: Number,
        required: true,
    },
    chapterName:{
        type: String,
        required: true,
    },
    chapterDate:{
        type: String,
        required: true,
    },
    pageUrls:{
        type: Array,
        required: true,
    },
    chapterCoverUrl:{
        type: String,
        required: true,
    },
    chapterPrice:{
        type: Number,
        required: true,
    },

})

module.exports = mongoose.model('chapters', chapterSchema)