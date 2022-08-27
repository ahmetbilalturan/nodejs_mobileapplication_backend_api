var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var favoritesSchema = new Schema({
    userID:{
        type: Number,
        required: true,
    },
    favMangaIDs:{
        type: Array,
        required: true,
    },
    subMangaIDs:{
        type: Array,
        required: true,
    }
})

module.exports = mongoose.model('favorites&subscriptions', favoritesSchema)