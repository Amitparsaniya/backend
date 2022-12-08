const { isValidObjectId } = require('mongoose')
const passwordresetToken =require('../models/passwordreset')

exports.isValidpassResetToken = async(req,res,next)=>{
    const {token,userId}= req.body

    if(!token.trim() || !isValidObjectId(userId)){
        return res.send({error:'Invalid request!'})
    }

   const resettoken= await passwordresetToken.findOne({owner:userId})
    if(!resettoken){
        return res.send({error:'Unauthorized access ,Invalid request!'})
    }

    const matched= await resettoken.comparetoken(token)

    if(!matched){
        return res.send({error:'Unauthorized access ,Invalid request!'})
    }
    req.resettoken =resettoken
    next()
}