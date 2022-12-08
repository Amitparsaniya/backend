const cloudinary = require('cloudinary').v2
const { isValidObjectId } = require('mongoose')
const movie = require('../models/movie')


exports.uploadTrailer = async (req, res) => {
    const { file } = req
    if (!file) return res.send({ error: "video file is missing!" })

    const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, { resource_type: 'video' })
    res.send({ secure_url, public_id })
}

exports.createMovie = async (req, res) => {
    try { 
        const { file, body } = req
        const {
            title, storyline, director, releseDate, status, type, genres, tags, cast, writers, trailer, language,poster
        } = body
        const newmovie = new movie({
            title, storyline, releseDate, status, type, genres, tags, cast, trailer, language,poster
        })
        if (director) {
            if (!isValidObjectId(director)) return res.send({ error: "Invalid director id!" })
            newmovie.director = director
        }
        if (writers) {
            for (let writerId of writers) {
                if (!isValidObjectId(writerId)) return res.send({ error: "Invalid writer id!" })
            }

            newmovie.writers = writers
        }
        //  uploding poster
        if(file){
        const { public_id, secure_url, responsive_breakpoints } = await cloudinary.uploader.upload(file.path, {
            transformation: {
                width: 1280,
                height: 720
            },
            responsive_breakpoints: {
                create_derived: true, max_width: 640, max_images: 3
            }
        })

        const finalposter = { secure_url, public_id, responsive: [] }

        const { breakpoints } = responsive_breakpoints[0]
        if (breakpoints.length) {
            for (let imgObj of breakpoints) {
                const { secure_url } = imgObj
                finalposter.responsive.push(secure_url)
            }
        }
        newmovie.poster = finalposter
    }
        await newmovie.save()

        res.send({ id: newmovie._id, title, secure_url })
        // console.log(res,"sucess");
    } catch (error) {
        res.send(error)
        console.log(error);
    }
}

exports.updateMovieWithoutPoster = async (req, res) => {
    try {
        const { movieId } = req.params
        if (!isValidObjectId(movieId)) return res.send({ error: "Invalid movie ID!" })

        if (!req.file) return res.send({ error: "movie poster is missing!" })

        const Movie = await movie.findById(movieId)
        if (!Movie) return res.send({ error: "Movie not found!" })

        const {
            title, storyline, director, releseDate, status, type, genres, tags, cast, writers, trailer, language
        } = req.body

        Movie.title = title
        Movie.storyline = storyline
        Movie.releseDate = releseDate
        Movie.status = status
        Movie.type = type
        Movie.genres = genres
        Movie.tags = tags
        Movie.cast = cast
        Movie.trailer = trailer
        Movie.language = language


        if (director) {
            if (!isValidObjectId(director)) return res.send({ error: "Invalid director id!" })
            Movie.director = director
        }
        if (writers) {
            for (let writerId of writers) {
                if (!isValidObjectId(writerId)) return res.send({ error: "Invalid writer id!" })
            }
            Movie.writers = writers
        }


        // update poster
        // removing poster from cloud
        const  posterID  = Movie.poster?.public_id
        console.log(posterID);
        if (posterID) {
                    const { result } = await cloudinary.uploader.destroy(posterID)
                    console.log(result);
                    if (result !== 'ok') {
                        return res.send({ error: "could not update poster at the moment!" })
                    }
                
                
                
                const { public_id, secure_url, responsive_breakpoints } = await cloudinary.uploader.upload(req.file.path, {
                    transformation: {
                        width: 1280,
                        height: 720
                    },
                    responsive_breakpoints: {
                        create_derived: true, max_width: 640, max_images: 3
                }
            })
            
            const finalposter = { secure_url, public_id, responsive: [] }
            
            const { breakpoints } = responsive_breakpoints[0]
            if (breakpoints.length) {
                for (let imgObj of breakpoints) {
                    const { secure_url } = imgObj
                    finalposter.responsive.push(secure_url)
                }
            }
            Movie.poster = finalposter   
        }

        await Movie.save()
        res.send({ messgae: 'movie is updated', Movie })
    } catch (error) {
        console.log(error);
        res.send(error)
    }
}


exports.removeMovie =async(req,res)=>{
        const { movieId } = req.params

        if (!isValidObjectId(movieId)) return res.send({ error: "Invalid movie ID!" })
        const Movie = await movie.findById(movieId)
        if (!Movie) return res.send({ error: "Movie not found!" })

        const posterId = Movie.poster?.public_id
        if(posterId){ 
            const {result} = await cloudinary.uploader.destroy(posterId)
            console.log(result); 
            if(result !== "ok") return res.send({error:"could not remove poster from the cloud!"})
        }

    const trailerId = Movie.trailer?.public_id
    console.log(trailerId);
    if(!trailerId)  return res.send({error:"could not find trailer from the cloud!"})
    
    const {result} = await cloudinary.uploader.destroy(trailerId,{resource_type:"video"})
    console.log(result);
    if(result !== "ok") return res.send({error:"could not remove trailer from the cloud!"})
    
    await  movie.findByIdAndDelete(movieId)
    res.send({messgae:"movie remove sucessfully!"})
    
}