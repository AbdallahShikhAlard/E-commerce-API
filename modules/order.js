const mongoos = require('mongoose')
const categorySchema = mongoos.Schema({
    orderItem :[{type: mongoos.Types.ObjectId , required:true , ref : 'OrderItems'  }],
    shappingAddress1 :{type: String , required:true },
    shappingAddress2 :{type: String , required:true },
    city :{type: String , required:true },
    zip :{type: String , required:true },
    country :{type: String , required:true },
    phone :{type: Number , required:true },
    status :{type: String , required:true },
    totalPrice :{type: Number , required:true },
    user :{type: mongoos.Types.ObjectId , required:true , ref:'Users'},
})

const Category = mongoose.model('category' , categorySchema)
module.exports = Category