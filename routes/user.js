const express = require('express')

const { create, verifyEmail, resendEmailVerificationToken, forgetpassword, sendresetpassowrdtokenstatus, resetpassword, signIn } = require('../controller/user')
const { isAuth } = require('../middleware/auth')
const { isValidpassResetToken } = require('../middleware/user')
const { userValidator , validate, validatepassword, signvalidator} = require('../middleware/validator')

const router = express.Router()

router.post('/create',userValidator,validate,create)
router.post('/verfiy-email',verifyEmail)
router.post('/signin',signvalidator,validate,signIn)
router.post('/resend-email-verificationtoken',resendEmailVerificationToken)
router.post('/forget-password',forgetpassword)
router.post('/verify-password-reset-token',isValidpassResetToken,sendresetpassowrdtokenstatus)
router.post('/reset-password',validatepassword,validate,isValidpassResetToken,resetpassword)


router.get('/is-auth',isAuth,(req,res)=>{
    const {user}= req
    
    res.send({user:{id:user.id,name:user.name,email:user.email,token:user.token, isVerified:user.isVerified,role:user.role}})
})

module.exports =router
