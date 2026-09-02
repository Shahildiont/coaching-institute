const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category title is required",
      });
    }

    const existing = await Category.findOne({
      title: { $regex: new RegExp("^" + title.trim() + "$", "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this title already exists",
      });
    }

    const payload = {
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "active",
      createdBy: req.user?._id || null,
    };

    const created = await Category.create(payload);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.trim().toLowerCase();
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const existing = await Category.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updatePayload = {};
    if (title && title.trim()) {
      const duplicate = await Category.findOne({
        title: { $regex: new RegExp("^" + title.trim() + "$", "i") },
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Category with this title already exists",
        });
      }

      updatePayload.title = title.trim();
    }

    if (typeof description === "string") {
      updatePayload.description = description.trim();
    }

    if (status) {
      updatePayload.status = status.trim().toLowerCase();
    }

    const updated = await Category.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};