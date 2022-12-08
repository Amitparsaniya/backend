const { check, validationResult } = require('express-validator')
const { isValidObjectId } = require('mongoose')
const mongoose = require('mongoose')
const genres = require('../utils/genres')

exports.userValidator = [
    check('name').trim().not().isEmpty().withMessage('Name is missing!'),
    check('email').normalizeEmail().isEmail().withMessage('email is missing!'),
    check('password').trim().not().isEmpty().withMessage('password is missing!').isLength({ min: 8, max: 20 }).withMessage('password must be 8 to 20 characters long')
]

exports.validatepassword = [
    check('newpassword').trim().not().isEmpty().withMessage('password is missing!').isLength({ min: 8, max: 20 }).withMessage('password must be 8 to 20 characters long')
]

exports.signvalidator = [
    check('email').normalizeEmail().isEmail().withMessage('emial is missing!'),
    check('password').trim().not().isEmpty().withMessage('password is missing!')
    // .isLength({ min: 8, max: 20 }).withMessage('password must be 8 to 20 characters long')
]

exports.actorInfoValidator = [
    check('name').trim().not().isEmpty().withMessage('Actor Name is missing!'),
    check('about').trim().not().isEmpty().withMessage('About is a required field!'),
    check('gender').trim().not().isEmpty().withMessage('Gender is a required field!'),

]

exports.validateMovie = [
   
    check('title').trim().not().isEmpty().withMessage('Movie title is missing!'),
        check('storyline').trim().not().isEmpty().withMessage('Story line is important!'),
        check('language').trim().not().isEmpty().withMessage('language is missing!'),
        check('releseDate').isDate().withMessage('relese date is missing!'),
        check('status').isIn(["public", "private"]).withMessage('Movie status must be public or private!'),
        check('type').trim().not().isEmpty().withMessage('Movie type is missing!'),
        check('genres').isArray().withMessage('Genres must be an array of strings!').custom((value) => {
            for (let g of value) {
                if (!genres.includes(g)) throw Error("invalid genres!")
            }
            return true
        }),
        check('tags').isArray({ min: 1 }).withMessage('Tags must be an array of stings!').custom((tags) => {
            for (let tag of tags) {
                if (typeof tag !== "string") throw Error('Tags must be an array of stings!')
            }
            return true
        }),
        check('cast').isArray().withMessage('cast must be an array of objecaats!').custom((cast) => {
            for (let c of cast) {
                if (!isValidObjectId(c.actor)) throw Error("invalid cast id inside cast!")
                if (!c.roleAs?.trim()) throw Error("Role as missing inside cast!")
                if (typeof c.leadActor !== 'boolean') throw Error("Only accepted boolean value inside leadActor inside cast!")
            }
            return true
        }),
     
        check('trailer').isObject().withMessage('trailer object must be an Object with url and public_id').custom(({ secure_url, public_id }) => {
            try {
                const result = new URL(secure_url)
                // console.log(result);
                if (!result.protocol.includes('http')) throw Error("Trailer url is invalid!")
                const arr = secure_url.split('/')
                const publicId = arr[arr.length - 1].split('.')[0]
                if (public_id !== publicId) throw Error('Trailer public_id is invalid!')
                return true
            }
        catch (e) {
                console.log(e);
                throw Error('Trailer url is invalid!')
            }
        }),
        
    ]

exports.validate = (req, res, next) => {
    try {

        const error = validationResult(req).array()
        if (error.length) {
            return res.send({ error: error[0].msg })
        }
        next()
    } catch (e) {
        console.log(e);
    }
}
