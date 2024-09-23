const mongoose = require('mongoose')
const categorySchema = mongoose.Schema({
    name :{type: String , required:true },
    color :{type: String , required:true },
    icon :{type: String ,default:'' }
})

const Category = mongoose.model('category', categorySchema)
module.exports = Category


