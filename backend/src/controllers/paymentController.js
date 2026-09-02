const mongoose = require("mongoose");
const Course = require("../models/Course");
const QuizAttempt = require("../models/QuizAttempt");
const Coupon = require("../models/Coupon");

function calculateDiscountAmount(coursePrice, coupon) {
  if (!coupon) return 0;

  if (coupon.discountType === "percent") {
    return Number(((coursePrice * coupon.discountValue) / 100).toFixed(2));
  }

  return Number(coupon.discountValue || 0);
}

exports.getCourseCheckout = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user && req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await Course.findById(courseId);

    if (!course || course.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const attempts = await QuizAttempt.find({
      user: userId,
      assignedCoupon: { $ne: null },
      status: { $in: ["submitted", "time_up"] },
    }).populate("assignedCoupon");

    const earnedCouponsMap = new Map();

    for (const attempt of attempts) {
      const coupon = attempt.assignedCoupon;

      if (!coupon) continue;
      if (coupon.status !== "active") continue;
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) continue;

      earnedCouponsMap.set(String(coupon._id), coupon);
    }

    const earnedCoupons = Array.from(earnedCouponsMap.values());

    return res.status(200).json({
      success: true,
      course,
      earnedCoupons,
      pricing: {
        originalPrice: course.price,
        discountAmount: 0,
        finalPrice: course.price,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load checkout",
    });
  }
};

exports.applyCourseCoupon = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { couponId } = req.body;
    const userId = req.user && req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon id",
      });
    }

    const course = await Course.findById(courseId);

    if (!course || course.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const earnedAttempt = await QuizAttempt.findOne({
      user: userId,
      assignedCoupon: couponId,
      status: { $in: ["submitted", "time_up"] },
    }).populate("assignedCoupon");

    if (!earnedAttempt || !earnedAttempt.assignedCoupon) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not assigned to your account",
      });
    }

    const coupon = earnedAttempt.assignedCoupon;

    if (coupon.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive",
      });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired",
      });
    }

    const rawDiscount = calculateDiscountAmount(course.price, coupon);
    const discountAmount = Math.min(rawDiscount, course.price);
    const finalPrice = Number((course.price - discountAmount).toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      appliedCoupon: coupon,
      pricing: {
        originalPrice: course.price,
        discountAmount,
        finalPrice,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to apply coupon",
    });
  }
};