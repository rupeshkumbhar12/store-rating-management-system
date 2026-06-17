const { Rating, Store } = require("../models");

exports.submitRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    if (!storeId || !rating) {
      return res.status(400).json({ msg: "storeId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    const existingRating = await Rating.findOne({
      where: { user_id: req.user.id, store_id: storeId },
    });

    if (existingRating) {
      return res.status(400).json({
        msg: "You have already rated this store. Use update rating instead.",
      });
    }

    const newRating = await Rating.create({
      user_id: req.user.id,
      store_id: storeId,
      rating,
    });

    res.status(201).json({
      msg: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = req.params.storeId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    const existingRating = await Rating.findOne({
      where: { user_id: req.user.id, store_id: storeId },
    });

    if (!existingRating) {
      return res.status(404).json({ msg: "Rating not found" });
    }

    existingRating.rating = rating;
    await existingRating.save();

    res.json({
      msg: "Rating updated successfully",
      rating: existingRating,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
