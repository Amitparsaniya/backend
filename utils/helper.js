const crypto =require('crypto')

// exports.sendError=(res,error, statusCode=401)=>{
    
// }

exports.generateRandomByte =()=>{
    return new Promise((reslove,reject)=>{
        crypto.randomBytes(30,(err,buff)=>{
            if(err) reject(err)
            const bufferstring = buff.toString('hex')
            console.log(bufferstring);
            reslove(bufferstring)
       })
    })
}

exports.formatActor = (actor)=>{
    const {_id,name,about,gender,avatar} = actor
    
   return { id:_id, name, about, gender, avatar:avatar?.url }
}

exports.parseData =(req,res,next)=>{
    // console.log(req.body);
    try{
        const {trailer,cast,genres,tags,writers}= req.body
        
        if(trailer)req.body.trailer =JSON.parse(trailer)
        if(cast)req.body.cast =JSON.parse(cast)
        if(genres)req.body.genres =JSON.parse(genres)
        if(tags)req.body.tags =JSON.parse(tags)
        if(writers)req.body.writers =JSON.parse(writers)
        next()
    }catch(error){
        console.log(error);
    }
    

}
