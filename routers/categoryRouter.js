const express = require('express')
const router = express.Router()
const Category = require('../modules/category')

router.get('/', async (req , res)=>{
    try {
        const categorylist = await Category.find()
        res.send(categorylist)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
    
})
router.get('/:id', async (req , res)=>{
    try {
        const category = await Category.findById(req.params.id)
        if(!category){
            res.status(500).send("Not found!")
        }
        res.status(200).send(category)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})
//create a category
router.post('/', async (req , res)=>{
    try {
        const {name , color , icon} =  req.body
        let category = new Category( {name , color , icon} )
        category = await category.save()
        res.send(category)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
    
})

router.put('/:id', async (req , res)=>{
    try {
        const {name , color , icon} = req.body
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {name , color , icon},
            {new : true}
        )
        if(!category){
            res.status(500).send("Not found!")
        }
        res.status(200).send(category)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})

router.delete('/:id', async (req , res)=>{
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        res.status(200).send(category)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})


module.exports = router