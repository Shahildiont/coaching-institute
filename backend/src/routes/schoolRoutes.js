const express = require("express");
const optionalAuth = require("../middleware/optionalAuth");
const {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
} = require("../controllers/schoolController");

const router = express.Router();

router.route("/").get(optionalAuth, getAllSchools).post(createSchool);

router
  .route("/:id")
  .get(optionalAuth, getSchoolById)
  .put(updateSchool)
  .delete(deleteSchool);

module.exports = router;