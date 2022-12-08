const crypto =require('crypto')
const User = require('../models/user')
const nodemailer =require('nodemailer')
const jwt = require('jsonwebtoken')
const EmailVerificationToken = require('../models/emailverification')
const passwordresetToken = require('../models/passwordreset')
const { isValidObjectId } = require('mongoose')
const { genrateOTP, geratemailtransporter } = require('../utils/mail')
const { generateRandomByte } = require('../utils/helper')
const { findByIdAndDelete } = require('../models/user')



exports.create = async (req,res)=>{
    try{
        // console.log(req.body);
        const {name, email,password} = req.body
         const  olduser =await User.findOne({email})

        if(olduser){
            return res.send({error:"this email is allready in use!"})
        }
        const user = new User(req.body)

        await user.save()

        // genrate 6 digit otp
        let otp = genrateOTP()
        // store otp inside our db
        const newEmailVerificationToken =   new EmailVerificationToken({
            owner: user._id,
            token: otp
        })

        await newEmailVerificationToken.save()

        var transport = geratemailtransporter()

          transport.sendMail({
            from:"verification@reviewapp.com",
            to:user.email,
            subject: 'Email verification',
            html: `<p>Your verification otp</p>
                   <h1>${otp}</h1> 
            `,
          })
        // res.send('this is 1212122 page')
        // res.status(201).send({message:'please verify your email. OTP  has been sent your email account!'})
        res.status(201).send({user: {id:user._id,name:user.name,email:user.email}})

    }catch(e){
        res.status(400).send(e)
        console.log(e);
    }
}


exports.verifyEmail =  async(req,res)=>{
    const { userId,otp} = req.body
    if(!isValidObjectId(userId)){
        return  res.send({error:'Invalid User!'})
    }
     const user= await  User.findById(userId)
     if(!user){
        return res.send({error:'user not found'})
     }
     if(user.isVerified){
        return res.send({error:'user is all ready verified'})
     }

     const token = await EmailVerificationToken.findOne({owner:userId})

     if(!token){
        return ({error:'token not found'})
     }
     
     const isMatched =await token.comparetoken(otp)
     if(!isMatched) return res.send({error:'please submit a valid OTP'})
  
     user.isVerified =true
     await user.save()

     await EmailVerificationToken.findByIdAndDelete(token._id)
     
     var transport = geratemailtransporter()
      
      transport.sendMail({
          from:"verification@reviewapp.com",
          to:user.email,
          subject: 'Welcome Email ',
          html: `<h1>Welocme to our app ,thanks for choosing us.</h1> 
          `
        })
        const jwwttoken= jwt.sign({userId:user._id},process.env.JWT_SECRET)
        res.send({user:{id:user._id,name:user.name,email:user.email,token:jwwttoken,isVerified:user.isVerified,role:user.role} ,
           message:'your email is verified'})  

}

exports.resendEmailVerificationToken =async(req,res)=>{
        const {userId}= req.body

        const user= await  User.findById(userId)
        if(!user){
           return res.send({error:'user not found'})
        }

        if(user.isVerified){
            return res.send({error:"This email is allready verified"})
        }

        const allreadyHastoken = await EmailVerificationToken.findOne({
            owner: userId})

            if(allreadyHastoken){
                return res.send({error:'Only after hour u can request for another token!'})
            }

            
        let otp = genrateOTP()

        // store otp inside our db

        const newEmailVerificationToken =   new EmailVerificationToken({
            owner: user._id,
            token: otp
        })

        await newEmailVerificationToken.save()

        var transport = geratemailtransporter()

          transport.sendMail({
            from:"verification@reviewapp.com",
            to:user.email,
            subject: 'Email verification',
            html: `<p>Your verification otp</p>
                   <h1>${otp}</h1> 
            `
          })

          res.send({message:'New OTP has been sent to your registerd email account'})
}

exports.forgetpassword = async (req,res)=>{
    const {email} =req.body

    if(!email){
        return res.send({error:'email is missing!'})
    }
    const user = await User.findOne({email})
    if(!user){
        return res.status(404).send({error:'user not found'})
    }

   const allreadyHastoken= await passwordresetToken.findOne({owner:user._id})

   if(allreadyHastoken){
    return res.send({error:'Only after hour u can request for another Link!'})
   }

  const token = await generateRandomByte ()

  const newpasswordresetToken = await passwordresetToken({
    owner:user._id,
    token
  })
  await newpasswordresetToken.save()

  const resetpasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`

  const transport = geratemailtransporter()

  transport.sendMail({
    from:"security@reviewapp.com",
    to:user.email,
    subject: 'Reset password link',
    html: `<p>click here to reset password</p>
           <a href='${resetpasswordUrl}'>change password</a> 
    `
  })
  res.send({message:'Link sent to your email'})
}

exports.sendresetpassowrdtokenstatus = (req,res)=>{
    res.send({valid:true})
}
exports.resetpassword = async(req,res)=>{
    const {newpassword,userId} = req.body
    const user=  await User.findById(userId)

    const matched = await user.comparepassword(newpassword)
    if(matched){
        return res.send({error:'The new password must be different from the old one!'})
    }

    user.password =newpassword
    await user.save()
    
    const  transport = geratemailtransporter()
    
    transport.sendMail({
    from:"security@reviewapp.com",
    to:user.email,
    subject: ' password Reset Successfully',
    html: `<h1>password Reset Successfully</h1>
            <p>Now you can use new password</p>
    `
  })
  
  res.send({message:'password Reset Successfully,Now you can use new password'})
  await passwordresetToken.findByIdAndDelete(req.resettoken._id)
    
}

exports.signIn = async(req,res)=>{
  const {email,password}= req.body

  const user =await User.findOne({email})

  if(!user){
    return res.send({error:'Email/password is not match!'})
  }

   const matched =await user.comparepassword(password)
  if(!matched){
    return res.send({error:'Email/password is not match!'})
  }
  // const {_id}= user
  const jwwttoken= jwt.sign({userId:user._id},process.env.JWT_SECRET)

  res.send({user:{id:user._id,name:user.name,email,role:user.role,token:jwwttoken,isVerified:user.isVerified}})
}


