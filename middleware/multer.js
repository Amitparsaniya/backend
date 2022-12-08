const multer = require('multer')
const storage = multer.diskStorage({})

const imagefileFilter=(req,file,cb)=>{
    try{

        if(!file.mimetype.startsWith('image')){
            cb("supported only image files!")
        }
        cb(null,true)
    }catch(e){
        console.log(e);
    }
}
const videofileFilter=(req,file,cb)=>{
            if(!file.mimetype.startsWith('video')){
                cb("supported only image files!")
            }
        cb(null,true)
}

exports.uploadImage = multer({ storage, fileFilter:imagefileFilter })
exports.uploadVideo = multer({ storage, fileFilter:videofileFilter})