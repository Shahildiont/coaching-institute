const express = require("express")

const {getdashboardinfo} =require("../controllers/dashboardController");

const router = express.Router();

router.get("/getinfo",getdashboardinfo);

module.exports=router;