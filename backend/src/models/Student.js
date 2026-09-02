const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:"Student name is required",
            trim:true
        },
        course:{
            type:String,
        },
        status:{
            type:String,
        },
        phone:{
            type:Number,
        },
    }
)

module.exports = mongoose.model("student",studentSchema)