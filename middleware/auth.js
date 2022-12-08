const jwt =require('jsonwebtoken')
const User = require('../models/user')

exports.isAuth= async(req,res,next)=>{
  try{

    const token = req.headers?.authorization
    
    if(!token) return res.send({error:"Invalid token!"})
    const jwtToken =token.split('Bearer ')[1]
    
    const decode=  jwt.verify(jwtToken,process.env.JWT_SECRET)
    const {userId}= decode
    
    const user= await User.findById(userId)
    if(!user) return res.send({error:"Invalid token user not found!"})
    
    
    req.user= user
    next()
  }catch(e){
    console.log(e);
  }
}

exports.isAdmin=(req,res,next)=>{
  try{

    const {user}= req
    if(user.role !=='admin') return res.send({error:"unauthorized access!"})
    
    next()
  }catch(e){
    console.log(e);
  }

}