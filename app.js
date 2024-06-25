import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

let app = express()

app.get(cors({
    origin: '*',
    methods: 'GET POST',
    credentials: true
}))

// ------------expresConfiguration-----------------

//accepts json data like from form upto 16kb only
app.use(express.json({limit: "16kb"}))

//accepts data from url
// app.use(express.urlencoded())

//for storing files on server
app.use(express.static("public"))

app.use(cookieParser())


import userRoute from './src/routes/user.routes.js'

app.use('/users',userRoute)

// app.get('/', (req,res) => {
//     res.send("hi how are you, i am under the water")
// })
export  {app}