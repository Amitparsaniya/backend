const mongoose =require('mongoose')
const bcrypt = require('bcrypt')
const userSchema = mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required: true
    },
    email:{
        type:String,
        trim:true,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required: true
    },
    isVerified:{
        type:Boolean,
        required: true,
        default:false
    },
    role:{
        type:String,
        required:true,
        default:"user",
        enum:['user','admin']
    }
})
userSchema.methods.comparepassword =async function(password){
    const user = this
    const result =await bcrypt.compare(password, user.password)
    return result
}

userSchema.pre('save', async function(next){
   const  user =this
    if(user.isModified('password')){
        user.password =await  bcrypt.hash(user.password,10)
    }
    next()
})

const User = mongoose.model("User",userSchema)

module.exports =  User