const express = require('express')
const router = express.Router()
const Product = require('../modules/product')
const Category = require('../modules/category')
const User = require('../modules/user')
const authenticateToken = require('../middleware/authenticateToken')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const fs = require('fs-extra')

const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')

        if(isValid){
            uploadError= null
        }
      cb(uploadError, './public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(' ','-')
      const extention = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extention}`)
    }
  })
const upload = multer({ storage: storage })
// Swagger documentation  
/**  
 * @swagger  
 * tags:  
 *   name: Products  
 *   description: Product management  
 */ 


/**  
 * @swagger  
 * /product:  
 *    get:  
 *      tags: [Products]  
 *      description: Use to return all products  
 *      parameters:  
 *        - name: categorys  
 *          in: query  
 *          description: Comma-separated list of category IDs to filter products  
 *          required: false  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Successful response  
 *        '500':  
 *          description: Server error  
 */
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
/**  
 * @swagger  
 * /product/{id}:  
 *    get:  
 *      tags: [Products]  
 *      description: Use to return a specific product  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          description: ID of the product to return  
 *          required: true  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Successful response  
 *        '500':  
 *          description: Server error  
 */ 
router.get('/:id', async (req , res)=>{
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).send(product)    
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})
/**  
 * @swagger  
 * /product/get/Featured:  
 *    get:  
 *      tags: [Products]  
 *      description: Use to return featured products  
 *      responses:  
 *        '200':  
 *          description: Successful response  
 *        '500':  
 *          description: Server error  
 */  
router.get('/get/Featured', async (req , res)=>{
    try {
        const product = await Product.find({isFeatured : true})
        res.status(200).send(product)    
    } catch (err) {
        res.status(500).json({ message : err.message})
    }
})
/**  
 * @swagger  
 * /product:  
 *    post:  
 *      tags: [Products]  
 *      description: Create a new product  
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
 *                description:  
 *                  type: string  
 *                richDescription:  
 *                  type: string  
 *                brand:  
 *                  type: string  
 *                price:  
 *                  type: number  
 *                category:  
 *                  type: string  
 *                countInStock:  
 *                  type: number  
 *                rating:  
 *                  type: number  
 *                numReviews:  
 *                  type: number  
 *                isFeatured:  
 *                  type: boolean  
 *      responses:  
 *        '200':  
 *          description: Successful response with the created product  
 *        '500':  
 *          description: Server error  
 */  
router.post('/' , authenticateToken , upload.single('image') , async (req , res)=>{        
        try {
        const user = await User.findById(req.user.id)
        if(!user.isAdmin){     
            return res.status(400).send("not admin")
        }
        const thecategory = await Category.findById(req.body.category)
        if(!thecategory) return res.status(400).send("category not found")
        const file = req.file
        if(!file){throw new Error("there is no file with the request");
        }
        const fileName = file.filename
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`
        const {
            name, 
            description ,
            richDescription ,
            brand ,
            price ,
            category ,
            countInStock ,
            rating ,
            numReviews ,
            isFeatured } = req.body
            
        let product = new Product({name, 
            description ,
            richDescription ,
            image : `${basePath}${fileName}` ,
            brand ,
            price ,
            category ,
            outOfCarts: countInStock,
            countInStock ,
            rating ,
            numReviews ,
            isFeatured 
        })
        product = await product.save()  
        res.status(200).send(product)     
    } catch (err) {
        res.status(500).send({message : err.message})    
    }
})
/**  
 * @swagger  
 * /product:  
 *    post:  
 *      tags: [Products]  
 *      description: Create a new product  
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
 *                description:  
 *                  type: string  
 *                richDescription:  
 *                  type: string  
 *                brand:  
 *                  type: string  
 *                price:  
 *                  type: number  
 *                category:  
 *                  type: string  
 *                countInStock:  
 *                  type: number  
 *                rating:  
 *                  type: number  
 *                numReviews:  
 *                  type: number  
 *                isFeatured:  
 *                  type: boolean  
 *      responses:  
 *        '200':  
 *          description: Successful response with the created product  
 *        '500':  
 *          description: Server error  
 */  
// update product 
router.put('/:id' ,authenticateToken, async (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id))return res.status(500).send("invaled product ID")
    try {
    const USER = await User.findById(req.user.id)
    if(!USER.isAdmin){     
        return res.status(400).send("not admin")
    }
    const user = await User.findById(req.user.id)
    if(!user.isAdmin){     
        return res.status(400).send("not admin")
    }
    const {
        name, 
        description ,
        richDescription ,
        image ,
        brand ,
        price ,
        category ,
        countInStock ,
        rating ,
        numReviews ,
        isFeatured } = req.body
    const product =  await Product.findByIdAndUpdate(req.params.id , {
        name, 
        description ,
        richDescription ,
        image ,
        brand ,
        price ,
        category ,
        countInStock ,
        rating ,
        numReviews ,
        isFeatured 
    }, {new :true})
    res.status(200).send(product)     
} catch (err) {
    res.status(500).send({message : err.message})    
}
})
/**  
 * @swagger  
 * /product:  
 *    post:  
 *      tags: [Products]  
 *      description: Create a new product  
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
 *                description:  
 *                  type: string  
 *                richDescription:  
 *                  type: string  
 *                brand:  
 *                  type: string  
 *                price:  
 *                  type: number  
 *                category:  
 *                  type: string  
 *                countInStock:  
 *                  type: number  
 *                rating:  
 *                  type: number  
 *                numReviews:  
 *                  type: number  
 *                isFeatured:  
 *                  type: boolean  
 *      responses:  
 *        '200':  
 *          description: Successful response with the created product  
 *        '500':  
 *          description: Server error  
 */  
// upload products images Array
router.put('/images/:id' ,authenticateToken,upload.array('images',10), async (req , res)=>{
    if(!mongoose.isValidObjectId(req.params.id))return res.status(500).send("invaled product ID")
    try {
        const user = await User.findById(req.user.id)
        if(!user.isAdmin){     
            return res.status(400).send("not admin")
        }
        const imagesArray = []
        const files = req.files
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`
        await files.map(file=>{
            const fileName = file.filename
            imagesArray.push(`${basePath}${fileName}`)
        })
       
    const product =  await Product.findByIdAndUpdate(req.params.id , {images:imagesArray}, {new :true})
    res.status(200).send(product)     
} catch (err) {
    res.status(500).send({message : err.message})    
}
})
/**  
 * @swagger  
 * /product/{id}:  
 *    delete:  
 *      tags: [Products]  
 *      description: Delete a specific product  
 *      security:  
 *        - bearerAuth: []  
 *      parameters:  
 *        - name: id  
 *          in: path  
 *          required: true  
 *          description: ID of the product to delete  
 *          schema:  
 *            type: string  
 *      responses:  
 *        '200':  
 *          description: Successful response confirming deletion  
 *        '500':  
 *          description: Server error  
 */ 
router.delete('/:id', authenticateToken,async (req , res)=>{
    try {
        const USER = await User.findById(req.user.id)
        if(!USER.isAdmin){     
            return res.status(400).send("not admin")
        }
        if(!mongoose.isValidObjectId(req.params.id))return res.status(500).send("invaled product ID")
        const user = await User.findById(req.user.id)
        if(!user.isAdmin){     
            return res.status(400).send("not admin")
        }
        const product = await Product.findByIdAndDelete(req.params.id)
        if(!product){throw new Error("product not found");
        }
        const imageURL =  product.image.split('/')
        const imageName = imageURL[4]
        const imagepath = path.join(__dirname , '..','public' , 'uploads',imageName)
        
        if(fs.existsSync(imagepath)){
            fs.remove(imagepath)
        }

        const imagesArray = await product.images.map(images=>{
            const ImageURL = images.split('/')
            const ImageName = ImageURL[4]
            const Imagepath = path.join(__dirname , '..','public' , 'uploads',ImageName)
            if(fs.existsSync(Imagepath)){
                fs.remove(Imagepath)
            }
        })
        
        res.status(200).send(product)
    } catch (error) {
        res.status(500).json({ message : error.message})
    }
})


module.exports = router