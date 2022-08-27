const express = require('express')
const actions = require('../methods/actions')
const router = express.Router()

router.get('/', (req,res)=>{
    res.send('hello world')
})

router.post('/adduser', actions.addNew)
router.post('/login', actions.login)
router.get('/getinfo', actions.getinfo)
router.post('/getfavorites', actions.getfavorites)
router.post('/getsubscriptions', actions.getsubscriptions)
router.get('/testserver', function(req,res){
    res.json({success: true, msg: 'Sunucuya başarıyla bağlanıldı'})
})
router.get('/getallmangas', actions.getallmangas)
router.post('/addmanga', actions.addmanga)
router.post('/findfromallmangas', actions.findfromallmangas)
router.post('/addtofavorites', actions.addtofavorites)
router.post('/addtosubscriptions', actions.addtosubscriptions)
router.get('/getgenre', actions.getgenre)
router.get('/getartist', actions.getartist)
router.get('/getchapters', actions.getchapters)
router.post('/addchapter', actions.addchapter)
router.post('/checkifitsinfavorites', actions.checkifitsinfavorites)
router.post('/checkifitsinsubscriptions', actions.checkifitsinsubscriptions)
router.post('/removefromfavorites', actions.removefromfavorites)
router.post('/removefromsubscriptions', actions.removefromsubscriptions)
router.get('/gethomepage', actions.gethomepage)
router.post('/gethomepagecontent', actions.gethomepagecontent)
router.post('/addhomepagecontent', actions.addhomepagecontent)
router.post('/addchapterpage', actions.addchapterpage)
router.post('/getchapterpages', actions.getchapterpages)
router.post('/getartistsmangas', actions.getartistsmangas)

const path = require("path");
const fileUpload = require("express-fileupload");
const multer = require("multer");

var storage = multer.diskStorage({
    destination : function (req, res, cb){
        cb(null, path.join(__dirname, '../') + "/profilepictures");
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

router.post('/uploadProfilePicture', upload.single("image"), actions.uploadprofilepicture);

module.exports = router