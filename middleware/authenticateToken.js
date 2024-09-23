const jwt = require('jsonwebtoken');
const { model } = require('mongoose');
require('dotenv').config();

// Authentication Middleware 
const authenticateToken = (req, res, next) => {  
    const token = req.headers['authorization']?.split(' ')[1];  
    if (!token) return res.sendStatus(401).send("Login first");  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {  
      if (err) return res.sendStatus(403);  
      req.user = user;  
      next();  
    });  
  };

module.exports = authenticateToken ;