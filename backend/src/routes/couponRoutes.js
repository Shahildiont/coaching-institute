const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.route("/").get(getAllCoupons).post(createCoupon);
router.route("/:id").get(getCouponById).put(updateCoupon).delete(deleteCoupon);

module.exports = router;