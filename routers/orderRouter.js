const express = require('express')
const router = express.Router()
const Order = require('../modules/order')
const OrderItem = require('../modules/orderItems')
const Product = require('../modules/product')
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
// Create an order  
router.post('/', authenticateToken, async (req, res) => {  
    try {    
        const {  
            shappingAddress1,  
            shappingAddress2,  
            city,  
            zip,  
            country,  
            phone,  
            status,  
            orderItems  
        } = req.body;  
  
        if (!shappingAddress1 || !city || !zip || !country || !phone || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {  
            return res.status(400).json({ message: 'Missing required fields: shappingAddress1, city, zip, country, phone, or orderItems' });  
        }  

        for (const item of orderItems) {  
            if (!item.quantity || !item.product) {  
                return res.status(400).json({ message: 'Each order item must include both a quantity and a product ID.' });  
            }  
            
             
            const product = await Product.findById(item.product);  
            if (!product) {  
                return res.status(400).json({ message: `Product with ID ${item.product} not found.` });  
            }
            if (product.countInStock < item.quantity) {   
                return res.status(400).json({ message: `Insufficient stock for product ID ${item.product}. Available stock: ${product.countInStock}, Requested: ${item.quantity}` });  
            }  
            
        }  

        const orderItemsIds = await Promise.all(orderItems.map(async orderItem => {  
            let newOrderItem = new OrderItem({  
                quantity: orderItem.quantity,  
                product: orderItem.product  
            });  
            newOrderItem = await newOrderItem.save();  
            const populatedOrderItem = await OrderItem.findById(newOrderItem._id).populate('product', 'countInStock');  
            const product = populatedOrderItem.product;  

            if (product) {  
                const updatedCountInStock = product.countInStock - orderItem.quantity;  
                await Product.findByIdAndUpdate(product._id, { countInStock: updatedCountInStock });  
            } else {  
                throw new Error('Product not found');  
            }  
            return newOrderItem._id;  
        }));  

        const totalPrices = await Promise.all(orderItemsIds.map(async orderItemsId => {  
            const orderItem = await OrderItem.findById(orderItemsId).populate('product', 'price');  
            const totalPrice = orderItem.product.price * orderItem.quantity;  

            return totalPrice;  
        }));  

        const totalPrice = totalPrices.reduce((a, d) => a + d, 0);  

        let order = new Order({  
            orderItems: orderItemsIds,  
            shappingAddress1,  
            shappingAddress2,  
            city,  
            zip,  
            country,  
            phone,  
            status,  
            totalPrice,  
            user: req.user.id  
        });  

        order = await order.save();  
        res.status(200).json(order);  

    } catch (err) {   
        res.status(500).json({ message: err.message });  
    }  
});

router.put('/:id', async (req , res)=>{
    try {
        const {status} = req.body
        const order = await Order.findByIdAndUpdate( req.params.id , {status:status},{new : true})
        if(!order){
            throw new Error("not found");
        }
        res.status(200).json({message : "updated sucssesfuly"})    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})

router.delete('/:id', async (req , res)=>{
    try{
    const order = await Order.findByIdAndDelete( req.params.id ).then( async order=>{
        if(!order){
            throw new Error("not found");
        }
        order.orderItems.map( async orderItem=>{
            await OrderItem.findByIdAndDelete(orderItem)
        })
    })
        res.status(200).json({order , message : "deleted sucssesfuly"})
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})


module.exports = router