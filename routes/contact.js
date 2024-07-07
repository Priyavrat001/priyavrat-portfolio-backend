const express = require("express");
const Contact = require("../model/contactModel");
const router = express.Router();



router.post("/contact", async(req, res)=>{
    try {
        const {firstName, lastName, email, phoneNumber, message} = req.body;


        if (!firstName || !lastName || !email || !phoneNumber || !message) {
            return res.status(401).json({ success: false, message: "Please fill all fields" });
        };

        const contact = await Contact.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            message
        });

        res.status(200).json({success:true, message:"Contact form submited successfully", contact})
        
        
    } catch (error) {
        res.status(400).json({success:false, error})
    }
});


module.exports = router;