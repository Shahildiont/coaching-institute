const express = require("express")
const router = express.Router();
const {createRole,getRoles} = require("../controllers/roleController");

router.post("/createrole",createRole);
router.get("/getall",getRoles);


module.exports = router;