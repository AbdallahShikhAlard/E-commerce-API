const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const categoryRouter = require('./routers/categoryRouter')
const productRouter = require('./routers/poductRouter')
const userRouter = require('./routers/userRouter')
const orderRouter = require('./routers/orderRouter')
dotenv.config()


const app = express()
const port = 8080
app.use(express.json())
app.use(express.static('public'))

mongoose.connect(process.env.DB_URI)
const db = mongoose.connection
db.on('error' , ()=> {console.log('connection Error')})
db.once('open' , ()=>{console.log('connected to DB')})

app.use('/category', categoryRouter)
app.use('/product', productRouter)
app.use('/user', userRouter)
app.use('/order' , orderRouter)
app.use(( err , req , res , next)=>{
    if(err){
        res.status(500).json({message : err})
    }
})

app.listen(port , ()=>{console.log(`http://0.0.0.0:${port}`)})