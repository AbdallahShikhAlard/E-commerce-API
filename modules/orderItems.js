const mongoose = require('mongoose')

const orderitemSchema = mongoose.Schema({
    quantity:{
        type :Number ,
        required : true
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'product'
    }
})

const orderItems = mongoose.model('orderItems' , orderitemSchema)
module.exports = orderItems