const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const categoryRouter = require('./routers/categoryRouter')
const productRouter = require('./routers/poductRouter')
const userRouter = require('./routers/userRouter')
const orderRouter = require('./routers/orderRouter')
dotenv.config()

const app = express()
const port = 8080
app.use(express.json())
app.use(express.static('public'))

const swaggerDefinition = {  
  openapi: '3.0.0',  
  info: {  
    title: 'E-commerce API',  
    version: '1.0.0',  
    description: 'API documentation for the E-commerce application',  
  },  
  servers: [  
    {  
      url: 'http://localhost:8080',  
    },  
  ],  
  components: {  
    securitySchemes: {  
      BearerAuth: {  
        type: 'http',  
        scheme: 'bearer',  
        bearerFormat: 'JWT', // Optional for additional info  
      },  
    },  
  }
};

// Options for the swagger docs  
const options = {  
  swaggerDefinition,  
  apis: ['./routers/*.js'], // Adjust this path to your API route files  
};  

// Initialize swagger-jsdoc  
const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec)); 

mongoose.connect(process.env.DB_URI)
const db = mongoose.connection
db.on('error' , ()=> {console.log('connection Error')})
db.once('open' , ()=>{console.log('connected to DB')})


app.use('/categories', categoryRouter)
app.use('/product', productRouter)
app.use('/users', userRouter)
app.use('/orders' , orderRouter)


app.listen(port , ()=>{console.log(`http://localhost:${port}`)})