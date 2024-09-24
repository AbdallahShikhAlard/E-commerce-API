const express = require('express')
const router = express.Router()
const Order = require('../modules/order')
const OrderItem = require('../modules/orderItems')
const authenticateToken = require('../middleware/authenticateToken')



router.get('/', async (req , res)=>{
    try {
        const orderslist = await Order.find()
        .populate('user' , 'name')
        res.send(orderslist)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
router.get('/:id', async (req , res)=>{
    try {
        const order = await Order.findById(req.params.id)
        .populate('user' , 'name')
        .populate({path : 'orderItems' , populate : 'product'})
        if(!order){
            throw new Error("not found");
        }
        res.send(order)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
//create an order
router.post('/', authenticateToken ,async (req , res)=>{
    try {

        const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem =>{
            let newOrderItem = new OrderItem({
                quantity : orderItem.quantity,
                product : orderItem.product
            })

            newOrderItem = await newOrderItem.save()
            return newOrderItem._id;
        }))

        const newOrderItemResolved = await orderItemsIds
        
        const { shappingAddress1 , shappingAddress2 , city , zip , country , phone , status , totalPrice } =  req.body
        let order = new Order( {orderItems :  newOrderItemResolved , shappingAddress1 , shappingAddress2 , city , zip , country , phone , status , totalPrice ,user: req.user.id} )
        
        order = await order.save()        
        res.send(order)    

    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})

router.put('/:id', async (req , res)=>{
    try {
        const {status} = req.body
        const order = await Order.findByIdAndUpdate( req.params.id , {status:status},{new : true})
        if(!order){
            throw new Error("not found");
        }
        res.status(200).send(order)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})

router.delete('/:id', async (req , res)=>{
    try{
    const order = await Order.findByIdAndDelete( req.params.id)
    if(!order){
        throw new Error("not found");
    }
        res.status(200).send(order)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})


module.exports = router