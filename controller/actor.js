const Actor = require('../models/actor')
const cloudinary =require('cloudinary').v2
const { isValidObjectId } = require('mongoose');
const { formatActor } = require('../utils/helper');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});


exports.createActor = async (req, res) => {
    const { name, about, gender } = req.body
    const { file } = req

    const newactor = new Actor(req.body)
    if (file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            {gravity: "face", height: 500, width: 500, crop: "thumb"})
        newactor.avatar = { url: secure_url, public_id }
    }
    await newactor.save()
    res.status(201).send({actor:formatActor(newactor)})
}

exports.updateActor = async(req,res)=>{
    const { name, about, gender } = req.body
    const { file } = req
    const {actorid}= req.params

    if(!isValidObjectId(actorid)) return res.send({error:"Invalid request!"})
    const actor= await Actor.findById(actorid)
    if(!actor) return res.send({error:"Invalid request,record not found!"})

    const public_id= actor.avatar?.public_id
    // console.log(public_id);

    // remove old image
    if(public_id && file) {
        try{
            const { result } = await cloudinary.uploader.destroy(public_id)
            if(result !== 'ok')return res.send({error:"cloud not remove image from cloud!"})
            
        }catch(e){
            console.log(e)
        }
    }

    // upload a new avatar 
    if (file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path,      
            {gravity: "face", height: 500, width: 500, crop: "thumb"})
        
        actor.avatar = { url: secure_url, public_id }
    }
    // actor.name =name
    // actor.about=about
    // actor.gender= gender

    await actor.save()

    res.status(201).send(formatActor(actor))     

}


exports.removeActor= async(req,res)=>{
        const {actorId}= req.params
        
        if(!isValidObjectId(actorId)) return res.send({error:"Invalid request!"})
        
        const actor= await Actor.findById(actorId)
        if(!actor) return res.send({error:"Invalid request,record not found!"})
        
        const public_id= actor.avatar?.public_id
        
        if(public_id ) {
            try{
                const { result } = await cloudinary.uploader.destroy(public_id)
                if(result !== 'ok')return res.send({error:"cloud not remove image from cloud!"})
                
            }catch(e){
                console.log(e)
            }
        }
        
        await Actor.findByIdAndDelete(actorId)
        
        res.send({message:"Record removed successfully!"})
    }


exports.serchActor = async (req,res)=>{
    const {query} =req
    query.name
    console.log(query.name);

    const result=await Actor.find({$text:{$search:`"${query.name}"`}})

    const acotrs =  result.map((actor)=> formatActor(actor))

    res.send({results:acotrs})
}

exports.getLatestActors =async(req,res)=>{
    const result=await Actor.find().sort({createdAt:'-1'}).limit(12)

    const acotrs =  result.map((actor)=> formatActor(actor))

    res.send(acotrs)
}

exports.getSingleActor =async(req,res)=>{
    const {id} =req.params
    
    if(!isValidObjectId(id)) return res.send({error:"Invalid request!"})

    const actor=await Actor.findById(id)

    if(!actor) return res.send({error:"Invalid request, actor not found!"})

    res.send(formatActor(actor))
}

exports.getActors = async(req,res) =>{
        const {pageNo,limit} =req.query

    const  acotrs = await Actor.find({}).sort({createdAt:-1})
        .skip(parseInt(pageNo)*parseInt(limit))
        .limit(parseInt(limit))

        const profiles = acotrs.map(actor=> formatActor(actor))

        res.send({profiles})
}