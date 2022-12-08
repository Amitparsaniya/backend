exports.errorHandler = (err,req,res,next)=>{
    res.status(500).send({error:err.message || err})
    // next()
}