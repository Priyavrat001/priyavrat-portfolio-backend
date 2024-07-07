const mongoose = require("mongoose");
const validator = require("validator")

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please enter your first name"],
    },
    lastName: {
        type: String,
        required: [true, "Please enter your last name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your eamil"],
        validator: validator.default.isEmail
    },
    phoneNumber: {
        type: Number,
        required: [true, "Please enter your phone number"],
        maxLength:[11, "Phone number can not be more than 11 words"],
        validator: validator.default.isMobilePhone
    },

    message:{
        type:String,
        required:[true, "Please enter the message"],
        maxLength: [50, "Message can not be more than 50 words"]
    }

});

module.exports = mongoose.model("Contact", schema)