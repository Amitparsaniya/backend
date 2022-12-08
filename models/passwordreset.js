const mongoose =require('mongoose')
const bcrypt =require('bcrypt')

const passwordresetTokenSchema = mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token:{
        type: String,
        required: true
    },
    createAt:{
        type: Date,
        expires:3600,
        default: Date.now()
    }
})

passwordresetTokenSchema.methods.comparetoken =async function(token){
    const user = this
    const result =await bcrypt.compare(token, user.token)
    return result
}

passwordresetTokenSchema.pre('save', async function(next){
    const  user =this
     if(user.isModified('token')){
         user.token =await  bcrypt.hash(user.token,10)
     }
     next()
 })

emlvtoken = mongoose.model('passwordresettoken',passwordresetTokenSchema)


module.exports = emlvtoken