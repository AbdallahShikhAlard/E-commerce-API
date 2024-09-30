const express = require('express')
const router = express.Router()
const User = require('../modules/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateToken = require('../middleware/authenticateToken')

router.get('/', async (req , res)=>{
    try {
        const users = await User.find().select('-passwordhash')
        res.send(users)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
    
})
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
router.put('/' , async (req , res)=>{

})
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