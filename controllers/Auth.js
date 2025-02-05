const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();



//sign up route handler
exports.signup = async(req,res) =>{
    try{
        //get data
        const {name,email,password,role} = req.body;
        //check if user already exist

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success : false,
                message : 'User already exists',
            });
        }

        //secure password
        let hashedPassword;
        try{
            hashedPassword = await bcrypt.hash(password,10);
        }catch(error){
            return res.status(500).json({
                success: false,
                message: 'Error in hashing Password',
            });
        }

        //create entry for User
        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            role
        })

        return res.status(200).json({
            success:true,
            message: 'User created successfully',
        });
    }
    catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:'User cannot be registered, please try again later',
            });
    }
}


exports.login = async(req,res) =>{
    try{
        //data fetch
        const {email,password} = req.body;
        //validation on email and password
        if(!email || !password){
            return res.status(400).json({
                success :false,
                message:"Please fill the details carefully",
            });
        }
        let user = await User.findOne({email});
        console.log(user);
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User is not registered"
            });
        }

        const payload = {
            email : user.email,
            id : user._id,
            role: user.role,
        }
        //verify password and generate a JWT token
        if(await bcrypt.compare(password,user.password)){
            //password match
            //token generation
            let token = jwt.sign(payload,
                                    process.env.JWT_SECRET,
                                        {
                                            expiresIn : "2h",
                                        });
            user.token = token;
            user.password = undefined;
        
            const options = {
                expires: new Date(Date.now() + 30000),
                httpOnly : true,
            }
            res.cookie("abcd_token",token,options).status(200).json({
                    success: true,
                    token,
                    user,
                    message: 'User Logged in successfully',
            });
                                        
        }
        else{
            return res.status(403).json({
                success: false,
                message: "Password Incorrect"
            });
        }
    }
    catch(error){
        console.error(error);
            return res.status(500).json({
                success:false,
                message:'Login Failure',
            });
    }
}


