const express = require('express')
const router = express.Router()
const Category = require('../modules/category')
const authenticateToken = require('../middleware/authenticateToken')
const User = require('../modules/user')
/**  
 * @swagger  
 * tags:  
 *   name: Categories  
 *   description: Category management  
 */  

/**  
 * @swagger  
 * /categories:  
 *    get:  
 *      tags: [Categories]  
 *      description: Retrieve a list of all categories  
 *      responses:  
 *        '200':  
 *          description: A list of categories  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: array  
 *                items:  
 *                  type: object  
 *                  properties:  
 *                    id:  
 *                      type: string  
 *                    name:  
 *                      type: string  
 *                    color:  
 *                      type: string  
 *                    icon:  
 *                      type: string  
 *        '500':  
 *          description: Server error  
 */  
router.get('/', async (req , res)=>{
    try {
        const categorylist = await Category.find()
        res.send(categorylist)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
/**  
 * @swagger  
 * /categories/{id}:  
 *    get:  
 *      tags: [Categories]  
 *      description: Get a specific category by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the category to retrieve  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Category found  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: object  
 *                properties:  
 *                  id:  
 *                    type: string  
 *                  name:  
 *                    type: string  
 *                  color:  
 *                    type: string  
 *                  icon:  
 *                    type: string  
 *        '404':  
 *          description: Not found  
 *        '500':  
 *          description: Server error  
 */  
router.get('/:id', async (req , res)=>{
    try {
        const category = await Category.findById(req.params.id)
        if(!category){
            res.status(500).send("Not found!")
        }
        res.status(200).send(category)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})
/**  
 * @swagger  
 * /categories:  
 *    post:  
 *      tags: [Categories]  
 *      description: Create a new category  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *              type: object  
 *              properties:  
 *                name:  
 *                  type: string  
 *                color:  
 *                  type: string  
 *                icon:  
 *                  type: string  
 *      responses:  
 *        '200':  
 *          description: Category created successfully  
 *        '500':  
 *          description: Server error  
 */  
router.post('/', authenticateToken,async (req , res)=>{
    try {
        const USER = await User.findById(req.user.id)
        if(!USER.isAdmin){     
            return res.status(400).send("not admin")
        }
        const {name , color , icon} =  req.body
        let category = new Category( {name : req.body.name , color :req.body.color, icon : req.body.icon} )
        category = await category.save()
        res.send(category)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
/**  
 * @swagger  
 * /categories/{id}:  
 *    put:  
 *      tags: [Categories]  
 *      description: Update an existing category by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the category to update  
 *          schema:  
 *            type: string  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *              type: object  
 *              properties:  
 *                name:  
 *                  type: string  
 *                color:  
 *                  type: string  
 *                icon:  
 *                  type: string  
 *      responses:  
 *        '200':  
 *          description: Category updated successfully  
 *        '404':  
 *          description: Not found  
 *        '500':  
 *          description: Server error  
 */  
router.put('/:id',authenticateToken ,async (req , res)=>{
    try {
        const USER = await User.findById(req.user.id)
        if(!USER.isAdmin){     
            return res.status(400).send("not admin")
        }
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
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})
/**  
 * @swagger  
 * /categories/{id}:  
 *    delete:  
 *      tags: [Categories]  
 *      description: Delete a category by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the category to delete  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Category deleted successfully  
 *        '404':  
 *          description: Not found  
 *        '500':  
 *          description: Server error  
 */  
router.delete('/:id',authenticateToken, async (req , res)=>{
    try {
        const USER = await User.findById(req.user.id)
        if(!USER.isAdmin){     
            return res.status(400).send("not admin")
        }
        const category = await Category.findByIdAndDelete(req.params.id)
        res.status(200).send(category)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})


module.exports = router