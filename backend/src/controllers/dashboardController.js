const mongoose = require("mongoose");

const courses = require("../models/Course");
const enquires = require("../models/Enquiry");
const quizattemps = require("../models/QuizAttempt");
const quizes = require("../models/Quiz");
const questions = require("../models/Question");



const getdashboardinfo = async (req,res) =>{
    try{
        const totalcourses = await courses.countDocuments({status:"active"})
        const totalenquires = await enquires.countDocuments()
        const totalquizes = await quizes.countDocuments({status:"active"})
        const totalattempts = await quizattemps.countDocuments()

        // console.log(totalcourses)
        return res.json({totalcourses:totalcourses,
            totalenquires:totalenquires,
            totalquizes:totalquizes,
            totalattempts:totalattempts})
    }catch(err){
        res.json(err)
        console.log(err)
    }
};

module.exports = {
    getdashboardinfo
}















