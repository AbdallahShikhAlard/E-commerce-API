const mongoose = require('mongoose')
const orderSchema = mongoose.Schema({
    orderItems :[
        {
        type: mongoose.Types.ObjectId ,
        required:true ,
        ref : 'orderItems'  
        }
    
    ],
    shappingAddress1 :{
        type: String , required:true   
    },
    shappingAddress2 :{
        type: String , required:true
    },
    city :{
        type: String , required:true 
    },
    zip :{
        type: String , required:true
     },
    country :{
        type: String , required:true 
    },
    phone :{
        type: Number , required:true 
    },
    status :{
        type: String ,  
        default  : 'pending'
    },
    totalPrice :{
        type: Number ,  
        required : true
    },
    user :{
        type: mongoose.Types.ObjectId , 
        required:true , ref:'user'
    },
    dateOrderd : {
        type : Date,
        default : Date.now
    }
})

const Order = mongoose.model('order' , orderSchema)
module.exports = Order