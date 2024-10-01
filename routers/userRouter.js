const express = require('express')
const router = express.Router()
const User = require('../modules/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateToken = require('../middleware/authenticateToken')

/**  
 * @swagger  
 * tags:  
 *   name: Users  
 *   description: User management  
 */  

/**  
 * @swagger  
 * /users:  
 *    get:  
 *      tags: [Users]  
 *      description: Retrieve a list of users  
 *      responses:  
 *        '200':  
 *          description: A list of users  
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
 *                    email:  
 *                      type: string  
 *                    phone:  
 *                      type: string  
 *                    isAdmin:  
 *                      type: boolean  
 *        '500':  
 *          description: Server error  
 */  
router.get('/', async (req , res)=>{
    try {
        const users = await User.find().select('-passwordhash')
        res.send(users)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
/**  
 * @swagger  
 * /users/{id}:  
 *    get:  
 *      tags: [Users]  
 *      description: Get a user by ID  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the user to retrieve  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: User found  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: object  
 *                properties:  
 *                  id:  
 *                    type: string  
 *                  name:  
 *                    type: string  
 *                  email:  
 *                    type: string  
 *                  phone:  
 *                    type: string  
 *                  isAdmin:  
 *                    type: boolean  
 *        '500':  
 *          description: User not found or server error  
 */  
router.get('/:id', async (req , res)=>{
    try {
        const user = await User.findById(req.params.id).select('-passwordhash')
        if(!user){
            res.status(500).send("Not found!")
        }
        res.status(200).send(user)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})
/**  
 * @swagger  
 * /users:  
 *    post:  
 *      tags: [Users]  
 *      description: Create a new user  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *              type: object  
 *              properties:  
 *                name:  
 *                  type: string  
 *                email:  
 *                  type: string  
 *                passwordhash:  
 *                  type: string  
 *                phone:  
 *                  type: string  
 *                isAdmin:  
 *                  type: boolean  
 *                street:  
 *                  type: string  
 *                apartment:  
 *                  type: string  
 *                zip:  
 *                  type: string  
 *                city:  
 *                  type: string  
 *                country:  
 *                  type: string  
 *      responses:  
 *        '200':  
 *          description: User created successfully  
 *        '500':  
 *          description: Server error  
 */  
router.post('/' , async (req , res)=>{
    try {
        let user = new User({
            name :req.body.name,
            email :req.body.email,
            passwordhash:req.body.passwordhash,
            phone :req.body.phone,
            isAdmin:req.body.isAdmin,
            street:req.body.street,
            apartment:req.body.apartment,
            zip:req.body.zip,
            city:req.body.city,
            country:req.body.country
        })
        user = await user.save()
        res.status(200).send(user)
    } catch (err) {
        res.status(500).json({message : err.message})
    }
})
/**  
 * @swagger  
 * /users/login:  
 *    post:  
 *      tags: [Users]  
 *      description: User login  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *              type: object  
 *              properties:  
 *                email:  
 *                  type: string  
 *                password:  
 *                  type: string  
 *      responses:  
 *        '200':  
 *          description: User logged in successfully  
 *          content:  
 *            application/json:  
 *              schema:  
 *                type: object  
 *                properties:  
 *                  user:  
 *                    type: string  
 *                  token:  
 *                    type: string  
 *        '401':  
 *          description: Invalid login credentials  
 *        '500':  
 *          description: Server error  
 */  
router.post('/login' , async (req,res)=>{
    try {
        const user = await User.findOne({email : req.body.email})

        if(!user){return res.status(401).json({message :"not found"})}

        if(user &&  bcrypt.compareSync(req.body.password , user.passwordhash)){
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{expiresIn : '1d'});  
            res.status(200).json({user:user.name , token : token})
        }else{
            res.status(500).json({message : "wrong password"})
        }
    } catch (err) {
        res.status(500).json({message : err.message})
    }
})

/**  
 * @swagger  
 * /users:  
 *    put:  
 *      tags: [Users]  
 *      description: Update user information  
 *      security:  
 *        - bearerAuth: []  
 *      requestBody:  
 *        required: true  
 *        content:  
 *          application/json:  
 *            schema:  
 *              type: object  
 *              properties:  
 *                name:  
 *                  type: string  
 *                oldPassword:  
 *                  type: string  
 *                newPassword:  
 *                  type: string  
 *      responses:  
 *        '200':  
 *          description: User information updated successfully  
 *        '404':  
 *          description: User not found  
 *        '403':  
 *          description: Old password is incorrect  
 *        '500':  
 *          description: Server error  
 */ 
router.put('/', authenticateToken, async (req, res) => {  
    const { name, oldPassword, newPassword } = req.body;  

    try {  
        const user = await User.findById(req.user.id);  
        if (!user) {  
            return res.status(404).json({ message: 'User not found.' });  
        }  

        if (name) {  
            user.name = name;  
        }  

        if (oldPassword && newPassword) {  
            const isMatch = await bcrypt.compare(oldPassword, user.passwordhash);  
            if (!isMatch) {  
                return res.status(403).json({ message: 'Old password is incorrect.' });  
            }   
            user.passwordhash = await bcrypt.hash(newPassword, 10);  
        }  

        await user.save();  
        res.status(200).json({ message: 'User information updated successfully.', user });  
    } catch (err) {  
        res.status(500).json({ message: err.message });  
    }  
})

module.exports = router 