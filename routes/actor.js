const express = require('express')

const { createActor, updateActor, removeActor, serchActor, getLatestActors, getSingleActor, getActors } = require('../controller/actor')
const { isAuth, isAdmin } = require('../middleware/auth')
const { uploadImage } = require('../middleware/multer')
const { actorInfoValidator, validate } = require('../middleware/validator')

const router =  express.Router()

router.post('/create',isAuth,isAdmin,uploadImage.single('avatar'),actorInfoValidator,validate,createActor)
router.post('/update/:actorid',isAuth,isAdmin ,uploadImage.single('avatar'),actorInfoValidator,validate, updateActor)
router.delete('/:actorId',isAuth,isAdmin,removeActor)
router.get('/search',isAuth,isAdmin,serchActor)
router.get('/latest-uploads',isAuth,isAdmin,getLatestActors)
router.get('/actors',isAuth,isAdmin,getActors)
router.get('/single/:id',getSingleActor)



module.exports =router