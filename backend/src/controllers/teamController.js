const Team = require("../models/Team");
const User = require("../models/User");

const getAllTeams = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status.trim().toLowerCase();
    }

    const teams = await Team.find(filter).sort({ createdAt: -1 });

    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => {
        const members = await User.find({
          team: team._id,
          role: "staff",
        }).select("name email role");

        return {
          ...team.toObject(),
          members,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: teamsWithMembers.length,
      teams: teamsWithMembers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch teams",
    });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, description, status, members = [] } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    const existing = await Team.findOne({
      name: { $regex: new RegExp("^" + name.trim() + "$", "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Team name already exists",
      });
    }

    const team = await Team.create({
      name: name.trim(),
      description: description?.trim() || "",
      status: status || "active",
    });

    await User.updateMany({ team: team._id }, { $set: { team: null } });

    if (Array.isArray(members) && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members }, role: "staff" },
        { $set: { team: team._id } }
      );
    }

    const populatedMembers = await User.find({
      team: team._id,
      role: "staff",
    }).select("name email role");

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: {
        ...team.toObject(),
        members: populatedMembers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create team",
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, members = [] } = req.body;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (name && name.trim()) {
      const existing = await Team.findOne({
        name: { $regex: new RegExp("^" + name.trim() + "$", "i") },
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Team name already exists",
        });
      }

      team.name = name.trim();
    }

    if (typeof description === "string") {
      team.description = description.trim();
    }

    if (status) {
      team.status = status;
    }

    await team.save();

    await User.updateMany({ team: team._id }, { $set: { team: null } });

    if (Array.isArray(members) && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members }, role: "staff" },
        { $set: { team: team._id } }
      );
    }

    const populatedMembers = await User.find({
      team: team._id,
      role: "staff",
    }).select("name email role");

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      team: {
        ...team.toObject(),
        members: populatedMembers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update team",
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    await User.updateMany({ team: team._id }, { $set: { team: null } });
    await Team.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete team",
    });
  }
};

module.exports = {
  getAllTeams,
  createTeam,
  updateTeam,
  deleteTeam,
};