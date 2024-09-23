const express = require('express')
const router = express.Router()
const Product = require('../modules/product')
const Category = require('../modules/category')
const User = require('../modules/user')
const authenticateToken = require('../middleware/authenticateToken')
const mongoose = require('mongoose')
const product = require('../modules/product')

router.get('/' , async (req , res)=>{
    try {
        let felter = {}
        if(req.query.categorys){
            felter = {category : req.query.categorys.split(',')}
        }
        const products = await Product.find(felter)
        res.status(200).send(products)
    } catch (err) {
        res.status(500).send(err.message)
    }
    
})

router.get('/:id', async (req , res)=>{
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).send(product)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})
 
router.get('/get/Featured', async (req , res)=>{
    try {
        const product = await Product.find({isFeatured : true})
        res.status(200).send(product)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})


router.post('/' , authenticateToken , async (req , res)=>{        
        try {
        const user = await User.findById(req.user.id)
        if(!user.isAdmin){     
            return res.status(400).send("not admin")
        }
        const thecategory = await Category.findById(req.body.category)
        if(!thecategory) return res.status(400).send("category not found")
        const {name, description ,richDescription ,image ,brand ,price ,category ,countInStock ,rating ,numReviews ,isFeatured } = req.body
        let product = new Product({name, description ,richDescription ,image ,brand ,price ,category ,countInStock ,rating ,numReviews ,isFeatured })
        product = await product.save()  
        res.status(200).send(product)     
    } catch (err) {
        res.status(500).send({message : err.message})    
    }
})
// update a product
router.put('/:id' ,authenticateToken, async (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id))return res.status(500).send("invaled product ID")
    try {
    const user = await User.findById(req.user.id)
    if(!user.isAdmin){     
        return res.status(400).send("not admin")
    }
    const {name, description ,richDescription ,image ,brand ,price ,category ,countInStock ,rating ,numReviews ,isFeatured } = req.body
    const product =  await Product.findByIdAndUpdate(req.params.id , {name, description ,richDescription ,image ,brand ,price ,category ,countInStock ,rating ,numReviews ,isFeatured }, {new :true})
    res.status(200).send(product)     
} catch (err) {
    res.status(500).send({message : err.message})    
}
})

router.delete('/:id', authenticateToken,async (req , res)=>{
    try {
        const user = await User.findById(req.user.id)
        if(!user.isAdmin){     
            return res.status(400).send("not admin")
        }
        const product = await Product.findByIdAndDelete(req.params.id)
        res.status(200).send(product)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})


module.exports = router