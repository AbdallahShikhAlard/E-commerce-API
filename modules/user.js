const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = mongoose.Schema({
    name : {
        type : String ,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    passwordhash : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },   
    isAdmin : {
        type : Boolean,
        default : false
    }, 
    street : {
        type : String,
        default : ''
    },
    apartment : {
        type : String,
        default : ''
    },
    city : {
        type : String,
        default : ''
    },
    country : {
        type : String,
        default : ''
    },
})

UserSchema.pre('save', async function(next) {  
    if (!this.isModified('passwordhash')) return next()
    this.passwordhash = await bcrypt.hash(this.passwordhash, 10)  
    next() 
  })

UserSchema.virtual('id').get(function (){
    return this._id.toHexString()
})

UserSchema.set('toJSON', {virtuals : true})

const User = mongoose.model('user', UserSchema)
module.exports = User