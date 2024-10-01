const express = require('express')
const router = express.Router()
const Order = require('../modules/order')
const OrderItem = require('../modules/orderItems')
const Product = require('../modules/product')
const authenticateToken = require('../middleware/authenticateToken')


/**  
 * @swagger  
 * /orders:  
 *    get:  
 *      tags: [Orders]  
 *      description: Retrieve a list of orders  
 *      responses:  
 *        '200':  
 *          description: A list of orders  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: array  
 *                items:  
 *                  type: object  
 *                  properties:  
 *                    id:  
 *                      type: string  
 *                    user:  
 *                      type: object  
 *                      properties:  
 *                        name:  
 *                          type: string  
 *                    orderItems:  
 *                      type: array  
 *                      items:  
 *                        type: object  
 *                        properties:  
 *                          product:  
 *                            type: string  
 *                          quantity:  
 *                            type: integer  
 *                    totalPrice:  
 *                      type: number  
 *        '500':  
 *          description: Server error  
 */  
router.get('/', async (req , res)=>{
    try {
        const orderslist = await Order.find()
        .populate('user' , 'name')
        res.send(orderslist)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
/**  
 * @swagger  
 * /orders/{id}:  
 *    get:  
 *      tags: [Orders]  
 *      description: Retrieve an order by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the order to retrieve  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Order found  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: object  
 *                properties:  
 *                  id:  
 *                    type: string  
 *                  user:  
 *                    type: object  
 *                    properties:  
 *                      name:  
 *                        type: string  
 *                  orderItems:  
 *                    type: array  
 *                    items:  
 *                      type: object  
 *                      properties:  
 *                        product:  
 *                          type: string  
 *                        quantity:  
 *                          type: integer  
 *                  totalPrice:  
 *                    type: number  
 *        '404':  
 *          description: Order not found  
 *        '500':  
 *          description: Server error  
 */  
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

/**  
 * @swagger  
 * /orders:  
 *    post:  
 *      tags: [Orders]  
 *      description: Create a new order  
 *      security:  
 *        - bearerAuth: []  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *              type: object  
 *              properties:  
 *                shappingAddress1:  
 *                  type: string  
 *                  description: Primary shipping address  
 *                shappingAddress2:  
 *                  type: string  
 *                  description: Secondary shipping address (optional)  
 *                city:  
 *                  type: string  
 *                  description: City of the shipping address  
 *                zip:  
 *                  type: string  
 *                  description: Zip code for the shipping address  
 *                country:  
 *                  type: string  
 *                  description: Country of the shipping address  
 *                phone:  
 *                  type: string  
 *                  description: Phone number for the order  
 *                status:  
 *                  type: string  
 *                  description: Status of the order  
 *                orderItems:  
 *                  type: array  
 *                  items:  
 *                    type: object  
 *                    properties:  
 *                      quantity:  
 *                        type: integer  
 *                        description: Quantity of the product ordered  
 *                      product:  
 *                        type: string  
 *                        description: ID of the product being ordered  
 *      responses:  
 *        '200':  
 *          description: Order created successfully  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: object  
 *                properties:  
 *                  id:  
 *                    type: string  
 *                    description: ID of the newly created order  
 *                  orderItems:  
 *                    type: array  
 *                    items:  
 *                      type: string  
 *                  shappingAddress1:  
 *                    type: string  
 *                  shappingAddress2:  
 *                    type: string  
 *                  city:  
 *                    type: string  
 *                  zip:  
 *                    type: string  
 *                  country:  
 *                    type: string  
 *                  phone:  
 *                    type: string  
 *                  status:  
 *                    type: string  
 *                  totalPrice:  
 *                    type: number  
 *                    format: float  
 *                  user:  
 *                    type: string  
 *        '400':  
 *          description: Bad request, missing or invalid fields  
 *        '401':  
 *          description: Unauthorized, authentication failed  
 *        '500':  
 *          description: Server error  
 */ 
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
/**  
 * @swagger  
 * /orders/{id}:  
 *    put:  
 *      tags: [Orders]  
 *      description: Update the status of an existing order by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the order to update  
 *          schema:  
 *            type: string  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *                  $ref : '#components/schema/orders' 
 *      responses:  
 *        '200':  
 *          description: Order status updated successfully  
 *        '404':  
 *          description: Order not found  
 *        '500':  
 *          description: Server error  
 */
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
/**  
 * @swagger  
 * /orders/{id}:  
 *    delete:  
 *      tags: [Orders]  
 *      description: Delete an order by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the order to delete  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Order deleted successfully  
 *        '404':  
 *          description: Order not found  
 *        '500':  
 *          description: Server error  
 */ 
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