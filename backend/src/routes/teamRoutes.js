const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/adminMiddleware");
const {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teamController");

const router = express.Router();

router
  .route("/")
  .get(protect, allowRoles("admin"), getAllTeams)
  .post(protect, allowRoles("admin"), createTeam);

router
  .route("/:id")
  .put(protect, allowRoles("admin"), updateTeam)
  .delete(protect, allowRoles("admin"), deleteTeam);

module.exports = router;