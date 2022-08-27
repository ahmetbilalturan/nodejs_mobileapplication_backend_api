var mongoose = require('mongoose')
var Schema = mongoose.Schema;
const sequencing = require('../config/sequencing');


var mangaSchema = new Schema({
    _id : Number,
    mangaArtistID:{
        type: Number,
        require: true,
    },
    mangaName: {
        type: String,
        require: true,
    },
    mangaCoverUrl:{
        type: String,
        require: true,
    },
    mangaArtist:{
        type: String,
        require: true,
    },
    mangaGenre:{
        type: String,
        require: true,
    },
    chapterCount:{
        type: Number,
        require: true,
    },
    mangaPlot:{
        type: String,
        require: true,
    },
    mangaWeeklyPublishDay:{
        type: String,
        require: true,
    },
    mangaBannerUrl:{
        type: String,
        require: true,
    },
    status:{
        type: String,
        require: true,
    }

})

mangaSchema.pre('save', function(next) {
    let manga = this;
    sequencing.getSequenceNextValue("manga_id").
    then(counter => {
        if(!counter){
            sequencing.insertCounter("manga_id")
            .then(counter =>{
                manga._id = counter;
                next()
            })
            .catch(error => next(error))
        }else{
            manga._id = counter;
            next()
        }
    })
    .catch(error => next(error))
})
 
module.exports = mongoose.model('allmangas', mangaSchema)