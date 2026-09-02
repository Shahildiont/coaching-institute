const express = require("express");
const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} = require("../controllers/enquiryController");

const router = express.Router();

router.route("/").get(getAllEnquiries).post(createEnquiry);
router.route("/:id").get(getEnquiryById).put(updateEnquiry).delete(deleteEnquiry);

module.exports = router;