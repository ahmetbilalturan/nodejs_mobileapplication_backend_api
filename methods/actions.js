var User = require('../models/user')
var allmangas = require('../models/allmangas')
var favoritesAndSubscriptions = require('../models/favorites&subscriptions')
var homepagecollection = require('../models/homepage')
var chapter = require('../models/chapters')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
var MongoClient = require('mongodb').MongoClient;
const { default: mongoose } = require('mongoose')
const { MongoUnexpectedServerResponseError } = require('mongodb')
var url = "mongodb+srv://AhmetBilalTuran:Ab!159357!Ab@cluster0.zujm3.mongodb.net/mydatabase?retryWrites=true&w=majority";

var functions = {
    addNew: function(req,res){
        if((!req.body.username) || (!req.body.password) || (!req.body.email)){
            res.json({success: false, msg: 'Bütün Boşlukları Doldurunuz'})
        }
        else{
            User.findOne({
                username: req.body.username,
            }, function (err,user){
                if(err) throw err
                if(!user){
                    User.findOne({
                        email: req.body.email
                    }, function(err,user){
                        if(err) throw err
                        if(!user){
                            var newUser = User({
                                username: req.body.username,
                                password: req.body.password,
                                email: req.body.email,
                                profilepicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg'
                            });
                            newUser.save(function(err, newUser){
                                if(err){
                                    res.json({success: false, msg: 'Kayıt Başarısız'})
                                }
                                else{
                                    res.json({success: true, msg: 'Başarıyla Kaydolundu'})
                                    var newfavorites = favoritesAndSubscriptions({
                                        userID: newUser._id,
                                        favMangaIDs: Array(),
                                        subMangaIDs: Array(),
                                    })
                                    newfavorites.save(function(err){
                                        if(err) throw err;
                                    });
                                }
                            })
                        }else{
                            res.status(200).send({success: false, msg: 'Bu email kullanılmakta'})
                        }
                    })
                    
                }else{
                    res.status(200).send({success: false, msg: 'Bu kullanıcı adı kullanılmakta'})
                }
            })
            
        }
    },
    login: function (req,res){
        User.findOne({
            username: req.body.username
        }, function(err, user){
            if(err) throw err
            if(!user){
                res.status(200).send({success: false, msg: 'Giriş Başarısız, Kullanıcı Adı veya Şifre Yanlış'})
            }
            else{
                user.comparePassword(req.body.password, function(err, isMatch){
                    if(isMatch && !err){
                        var token = jwt.encode(user, config.secret)
                        res.json({success: true, token: token, msg: 'Giriş Başarılı'})
                    }
                    else{
                        return res.status(200).send({success: false, msg: 'Giriş Başarısız, Kullanıcı Adı veya Şifre Yanlış'})
                    }
                })
            }
        }
        )
    },
    getinfo: function(req,res){
        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'){
            var token = req.headers.authorization.split(' ')[1]
            var decodedtoken = jwt.decode(token, config.secret)
            return res.json({success: true, msg: 'hello ' + decodedtoken.username, "userid": decodedtoken._id, "username": decodedtoken.username, "email": decodedtoken.email, "profilepicture": `http://10.0.2.2:8080${decodedtoken.profilepicture}`, 'isArtist': decodedtoken.isArtist})
        }else{
            return res.json({success: false, msg: 'no headers'})
        }
    },

    getfavorites: function(req,res){
        MongoClient.connect(url, function(err, db){
            if (err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection('favorites&subscriptions').findOne({userID: parseInt(req.body.userID)}, function(err,favlist){
                if(err) throw err;
                res.send({success: true, 'array': favlist.favMangaIDs});
                db.close();
            })
           
        })
    },

    checkifitsinfavorites: function(req, res){
        MongoClient.connect(url, function(err, db){
            if (err) throw err;
            var dbo = db.db('mydatabase');
            dbo.collection(`favorites&subscriptions`).findOne({userID: parseInt(req.body.userID)}, function(err, favlist){
                if(err) throw err;
                if(favlist.favMangaIDs.includes(parseInt(req.body.mangaID))){
                    res.send({success: true, msg: 'Bu manga favori listesinde vardır'})
                }else{
                    res.send({success: false, msg: 'Bu manga favori listesinde bulunmamaktadır'})
                   
                }
                db.close();
            })
        })
    },

    removefromfavorites: function(req, res ){
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            var dbo = db.db('mydatabase');
            dbo.collection('favorites&subscriptions').findOneAndUpdate({userID: parseInt(req.body.userID)}, {$pull:{favMangaIDs: parseInt(req.body.mangaID)}}, function(err,result){
                if(err) throw err;
                res.send({success:true, msg: 'Başarıyla kaldırılmıştır'})
                db.close();
            })
        })
    },

    getsubscriptions: function(req,res){
        MongoClient.connect(url, function(err, db){
            if (err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection('favorites&subscriptions').findOne({userID: parseInt(req.body.userID)}, function(err,sublist){
                if(err) throw err;
                res.send({success: true, 'array': sublist.subMangaIDs});
                db.close();
            })
        })
    },

    checkifitsinsubscriptions: function(req, res){
        MongoClient.connect(url, function(err, db){
            if (err) throw err;
            var dbo = db.db('mydatabase');
            dbo.collection(`favorites&subscriptions`).findOne({userID: parseInt(req.body.userID)}, function(err, favlist){
                if(err) throw err;
                if(favlist.subMangaIDs.includes(parseInt(req.body.mangaID))){
                    res.send({success: true, msg: 'Bu manga abonelik listesinde vardır'})
                }else{
                    res.send({success: false, msg: 'Bu manga abonelik listesinde bulunmamaktadır'})
                   
                }
                db.close();
            })
        })
    },
    removefromsubscriptions: function(req, res ){
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            var dbo = db.db('mydatabase');
            dbo.collection('favorites&subscriptions').findOneAndUpdate({userID: parseInt(req.body.userID)}, {$pull:{subMangaIDs: parseInt(req.body.mangaID)}}, function(err,result){
                if(err) throw err;
                res.send({success:true, msg: 'Başarıyla kaldırılmıştır'})
                db.close();
            })
        })
    },
   
    addchapter: function(req,res){
        //////GİRDİLERİN BOŞ OLUP OLMADIĞINI KONTROL ET
        ////// FİLE GÖNDERME __DİR ALMA 
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            var dbo = db.db("mydatabase");
            var collectionChapter = dbo.collection('chapters');
            dbo.collection('allmangas').findOne({_id: parseInt(req.body.mangaID)}, function(err,manga){
                if(err) throw err;
                if(!manga){
                    res.send({success: false, msg: 'Bu ID de manga bulunnmamaktadır'})
                }else{
                    collectionChapter.findOne({mangaID: parseInt(req.body.mangaID), chapterName: req.body.chapterName}, function(err,chapters){
                        if(err) throw err;
                        if(!chapters){
                            collectionChapter.find({mangaID: parseInt(req.body.mangaID)}).toArray(function(err,result){
                                if(err) throw err;
                                var date = new Date()
                                var newChapter = chapter({
                                    mangaID: req.body.mangaID,
                                    chapterID: result.length+1,
                                    chapterName: req.body.chapterName,
                                    chapterDate: `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`,
                                    pageUrls: Array(),
                                    chapterCoverUrl: req.body.chapterCoverUrl,
                                    chapterPrice: req.body.chapterPrice,
                                })
                                newChapter.save(function(err,chapter){
                                    if(err) throw err;
                                    dbo.collection('allmangas').updateOne({_id : parseInt(req.body.mangaID)}, {$set: {chapterCount: result.length+1}}, {upsert: false}, function(err){
                                        if(err) throw err;
                                        res.json({success:true, msg: 'Bölüm Başarıyla Eklenmiştir'});
                                        db.close();
                                    })
                                })
                            });
                        }else{
                            res.send({success: false, msg: 'Bu başlıkta bölüm bulunmaktadır lütfen başlığı değiştirin'})
                        }
                    })
                }
            })
        })
    },

    getchapters: function(req,res){
        MongoClient.connect(url, function(err,db){
            if (err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection(`chapters`).find({mangaID: parseInt(req.query.mangaID)}).toArray(function(err,result){
                if(err) throw err;
                res.json({success:true, "array": result});
                db.close();
            });
        })
    }, 

    addchapterpage: function(req,res){
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            db.db('mydatabase').collection('chapters').updateOne({mangaID: parseInt(req.body.mangaID), chapterID: parseInt(req.body.chapterID)}, {$push: {pageUrls: req.body.url}}, function(err,result){
                if(err) throw err;
                res.send({success: true, msg: 'Sayfa başarıyla eklenmiştir'})
                db.close();
            })
        })
    },

    getchapterpages: function(req,res){
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            db.db('mydatabase').collection('chapters').findOne({mangaID: parseInt(req.body.mangaID), chapterID: parseInt(req.body.chapterID)}, function(err, chapter){
                if(err) throw err;
                res.send({success: true, 'pages': chapter.pageUrls})
                db.close()
            })
        })
    },

    gethomepage: function(req,res){
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection('homepagecollections').find().toArray(function(err,collections){
                if(err) throw err;
                res.json({success: true, "array": collections})
                db.close();
            })
        })
    },

    addhomepagecontent: function(req,res){
        var newContent = homepagecollection({
            collectionName: req.body.collectionName,
            collMangaIDs: Array(),
        })
        newContent.save(function(err, newContent){
            if(err) throw err;
            res.send({success: true, msg: 'İçerik başarıyla kaydedilmiştir'})
        })
    },

    gethomepagecontent: function(req,res){
        MongoClient.connect(url, function(err,db){
            if (err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection('homepagecollections').findOne({collectionName: req.body.collectionName}, function(err,collection){
                if(err) throw err;
                res.send({success:true, "mangaIDs": collection.collMangaIDs})
                db.close();
            })
        })
    }, 

    ///// File gönderme eklenecek
    addmanga: function(req,res){
        if((!req.body.mangaArtistID) || (!req.body.mangaName) || (!req.body.mangaCoverUrl) || (!req.body.mangaArtist) || (!req.body.mangaGenre) || (!req.body.mangaPlot) || (!req.body.mangaWeeklyPublishDay) || (!req.body.mangaBannerUrl)){
            res.json({success: false, msg: 'Bütün Boşlukları Doldurunuz'})
        }else{
        var newManga = allmangas({
            mangaArtistID: req.body.mangaArtistID,
            mangaName: req.body.mangaName,
            mangaCoverUrl: req.body.mangaCoverUrl,
            mangaArtist: req.body.mangaArtist,
            mangaGenre: req.body.mangaGenre,
            mangaPlot: req.body.mangaPlot,
            mangaWeeklyPublishDay: req.body.mangaWeeklyPublishDay,
            mangaBannerUrl: req.body.mangaBannerUrl,
            chapterCount: 0,
            status: 'Yeni',
        });
        newManga.save(function(err, newManga){
            if(err){
                res.json({success: false, msg: 'Ekleme Başarısız'})
            }
            else{
                res.json({success: true, msg: 'Başarıyla Eklendi'})
            }
        })
        }
    },

    getallmangas: function(req,res){
            allmangas.find({}, function(err, result) {
                if (err) throw err;
                res.json({success: true, "array": result });
            });
        
    },
    

    getgenre: function(req,res){
        allmangas.find({'mangagenre': req.query.mangagenre}, function(err, result){
            if (err) throw err;
            res.json({success: true, "array": result})
        })
    },

    getartist: function(req,res){
        allmangas.find({'mangaartist': req.query.mangaartist}, function(err, result){
            if (err) throw err;
            res.json({success: true, "array": result})
        })
    },

    getartistsmangas: function(req,res){
        User.findOne({_id: parseInt(req.body.mangaArtistID)}, function(err,user){
            if(err) {
                throw err;
            }else{
                if(user == null){
                    res.json({success: false, msg: 'Böyle bir kullanıcı bulunmamaktadır!'})
                }else{
                    if(user.isArtist){
                        allmangas.find({mangaArtistID: parseInt(req.body.mangaArtistID)}, function(err, mangas){
                            if(err){
                                throw err;
                            }else{
                                res.json({success: true, 'array': mangas})
                            }
                        })
                    }else{
                        res.json({success: false, msg: 'Çizer değilsiniz!'})
                    }
                }
            }
        })
    },

    findfromallmangas: function(req,res){
        allmangas.findOne({_id: parseInt(req.body._id)},function(err,result){
            if(err){
                res.json({success: false, msg: 'manga bulunamadı'})
            }else{
                if(result == null){
                    res.json({success: true, msg: 'Böyle bir manga bulunmamaktadır'})
                }else{
                res.json({success: true, "manga": result})
                }
            }
        })
    },
    
    addtofavorites: function(req,res){
        MongoClient.connect(url, function(err, db){
            if(err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection('allmangas').findOne({_id: parseInt(req.body.mangaID)}, function(err, manga){
                if(err) throw err;
                if(!manga){
                    res.send({success: false, msg: "Bu id'de manga bulunmamaktadır"})
                }else{
                    ////FAVORİ LİSTESİNDE IDSİ VERİLEN MANGA VAR MI YOK MU KONTROL ET
                    dbo.collection('favorites&subscriptions').findOneAndUpdate({userID: parseInt(req.body.userID)}, {$push:{favMangaIDs: parseInt(req.body.mangaID)}}, function(err,result){
                        if(err) throw err;
                        res.send({success: true, msg: 'Başarıyla eklenmiştir'})
                        db.close();
                    })
                }
            })

        })
    },
    addtosubscriptions: function(req,res){
        MongoClient.connect(url, function(err, db){
            if(err) throw err;
            var dbo = db.db("mydatabase");
            dbo.collection('allmangas').findOne({_id: parseInt(req.body.mangaID)}, function(err, manga){
                if(err) throw err;
                if(!manga){
                    res.send({success: false, msg: "Bu id'de manga bulunmamaktadır"})
                }else{
                    ////ABONELİK LİSTESİNDE IDSİ VERİLEN MANGA VAR MI YOK MU KONTROL ET
                    dbo.collection('favorites&subscriptions').findOneAndUpdate({userID: parseInt(req.body.userID)}, {$push:{subMangaIDs: parseInt(req.body.mangaID)}}, function(err,result){
                        if(err) throw err;
                        res.send({success: true, msg: 'Başarıyla eklenmiştir'})
                        db.close();
                    })
                }
            })

        })
    },
    uploadprofilepicture: function(req,res){
        if(req.file === "undefined" || req.file == null){
            return res.status(422).send('image cannot be empty')
        }
        let file = req.file;
        MongoClient.connect(url, function(err,db){
            if(err) throw err;
            var dbo = db.db("mydatabase");
            var myquery = {_id: parseInt(req.body.userid)}
            var newvalue = {$set:{profilepicture: `/profilepictures/${file.filename}`}}
            dbo.collection('users').updateOne(myquery,newvalue, function(err){
                if(err) throw err;
                db.close();
                return res.send({success: true, url: `http://10.0.2.2:8080/profilepictures/${file.filename}`,msg: 'Profil fotoğrafınız başarıyla değiştirilmiştir.'});      
            })
        })
    }
}

module.exports = functions