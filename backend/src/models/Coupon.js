const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      trim: true,
      uppercase: true,
      unique: true,
    },
    minPercentage: {
      type: Number,
      required: [true, "Minimum percentage is required"],
      min: [0, "Minimum percentage cannot be below 0"],
      max: [100, "Minimum percentage cannot exceed 100"],
    },
    maxPercentage: {
      type: Number,
      required: [true, "Maximum percentage is required"],
      min: [0, "Maximum percentage cannot be below 0"],
      max: [100, "Maximum percentage cannot exceed 100"],
    },
    discountType: {
      type: String,
      enum: ["percent", "flat"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount value must be at least 1"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.pre("validate", function () {
  if (this.minPercentage > this.maxPercentage) {
    this.invalidate("minPercentage", "From percentage cannot be greater than to percentage");
  }

  if (this.discountType === "percent" && this.discountValue > 100) {
    this.invalidate("discountValue", "Percentage discount cannot be greater than 100");
  }
});

module.exports = mongoose.model("Coupon", couponSchema);