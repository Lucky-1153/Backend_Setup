import dotenv from 'dotenv'
import {app} from './app.js'
import connectedDB from './src/db/index.js'

;dotenv.config({
    path: './.env'
})



connectedDB()
.then(() => {
    app.listen( process.env.PORT , () => {
        console.log(`server is running at port : ${process.env.PORT}` )
    } )
})
.catch( (err) => {
    console.log('server is not listening at port: ',err)
})
