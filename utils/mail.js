const nodemailer =require('nodemailer')

exports.genrateOTP =(otp_length=6)=>{
    // genrate 6 digit otp
    let otp =''
    for (let i = 1; i<=otp_length; i++) {
        const randomVal = Math.round( Math.random()*9 )
        otp += randomVal
    }

    return otp
}

exports.geratemailtransporter =()=>
    nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user:process.env.MAIL_TRAP_USER,
            pass:process.env.MAIL_TRAP_PASS
        }
      });
