const express =require('express')
const morgan = require('morgan')
require('express-async-errors')
require('dotenv').config()
const mongoose =require('mongoose')
require('./db/index')


const userRouter = require('./routes/user')
const actorRouter = require('./routes/actor')
const movieRouter = require('./routes/movie')


const { errorHandler } = require('./middleware/error')
const cors = require('cors')
const  app =express()
app.use(cors())
// app.use(express.json())---- it wiil be  a convert all response data coming from  a frontend data into json 
app.use(express.json())    
app.use(morgan('dev'))
app.use('/api/user',userRouter)
app.use('/api/actor',actorRouter)
app.use('/api/movie',movieRouter) 

app.use('/*',(req,res)=>{
    res.send({error:"Page Not Found!"})
})

app.use(errorHandler);


app.listen(8000,()=>{
    console.log('server is up on the port 8000');
})