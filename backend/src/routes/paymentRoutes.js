const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getCourseCheckout,
  applyCourseCoupon,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/course/:courseId/checkout", protect, getCourseCheckout);
router.post("/course/:courseId/apply-coupon", protect, applyCourseCoupon);

module.exports = router;