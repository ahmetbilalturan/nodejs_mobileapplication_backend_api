var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var homepageSchema = new Schema({
    collectionName: {
        type: String,
        required: true,
    },
    collMangaIDs: {
        type: Array,
        required: true,
    }
})

module.exports = mongoose.model('homepagecollection', homepageSchema)