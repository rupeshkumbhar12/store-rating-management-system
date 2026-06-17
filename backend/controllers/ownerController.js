const { fn, col } = require("sequelize");
const { Store, Rating, User } = require("../models");

exports.getAverageRating = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { owner_id: req.user.id },
      include: [
        {
          model: Rating,
          as: "ratings",
          attributes: [],
        },
      ],
      attributes: {
        include: [[fn("AVG", col("ratings.rating")), "averageRating"]],
      },
      group: ["Store.id"],
      subQuery: false,
    });

    if (!store) {
      return res.status(404).json({ msg: "No store found for this owner" });
    }

    const avg = store.getDataValue("averageRating");
    const averageRating = avg ? parseFloat(avg).toFixed(1) : "0.0";

    res.json({ averageRating: parseFloat(averageRating) });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getRatedUsers = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });

    if (!store) {
      return res.status(404).json({ msg: "No store found for this owner" });
    }

    const ratings = await Rating.findAll({
      where: { store_id: store.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const result = ratings.map((r) => ({
      user: r.user.name,
      rating: r.rating,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
