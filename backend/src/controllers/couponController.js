const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

async function hasOverlappingRange(minPercentage, maxPercentage, excludeId = null) {
  const query = {
    minPercentage: { $lte: maxPercentage },
    maxPercentage: { $gte: minPercentage },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingCoupon = await Coupon.findOne(query);
  return Boolean(existingCoupon);
}

exports.createCoupon = async (req, res) => {
  try {
    const { minPercentage, maxPercentage } = req.body;

    const overlapExists = await hasOverlappingRange(minPercentage, maxPercentage);

    if (overlapExists) {
      return res.status(400).json({
        success: false,
        message: "Coupon percentage range overlaps with an existing coupon",
      });
    }

    const coupon = await Coupon.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ minPercentage: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons",
    });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon id",
      });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupon",
    });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { minPercentage, maxPercentage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon id",
      });
    }

    const overlapExists = await hasOverlappingRange(minPercentage, maxPercentage, id);

    if (overlapExists) {
      return res.status(400).json({
        success: false,
        message: "Coupon percentage range overlaps with an existing coupon",
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon id",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};