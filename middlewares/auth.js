// auth , isStudent, isAdmin

 const jwt = require("jsonwebtoken");
 require("dotenv").config();

 exports.auth = (req,res,next) =>{
    try{
        // different ways to fetch token
        //console.log("cookie",req.cookies.token); //only if cookie is created
        //console.log("body",req.body.token);   // not so secure
        //console.log("header",req.header("Authorization")); // most preferable way

        
        const token =  req.header("Authorization").replace("Bearer ","") || req.body.token || req.cookies.token ;

        if(!token){
            return res.status(400).json({
                success : false,
                message : 'Token Missing.',
         });
        }
        //verify token
        try{
            const payload = jwt.verify(token,process.env.JWT_SECRET);
            console.log(payload);
            
            req.user = payload;
            
        }

        catch(error){
            return res.status(401).json({  
                success : false,
                message : 'INVALID Token.',
         });
        }
        next();
    } 
    catch(error){
        return res.status(401).json({
            success : false,
            message : 'Something went wrong while verifying the token.',
     });
    }
 }

 exports.isStudent = (req,res,next) =>{
        try{
            if(req.user.role != "Student"){
                return res.status(401).json({
                    success : false,
                    message : 'This is protected route for students.',
             });
            }
            next();
        }
        catch(error){
            return res.status(500).json({
                success : false,
                message : 'User role is not matching.',
         });
        }
 }

 exports.isAdmin = (req,res,next) =>{
    try{
        if(req.user.role != "Admin"){
            return res.status(401).json({
                success : false,
                message : 'This is protected route for admin.',
         });
        }
        next();
    }

    catch(error){
        return res.status(500).json({
            success : false,
            message : 'User role is not matching.',
     });
    }
}
