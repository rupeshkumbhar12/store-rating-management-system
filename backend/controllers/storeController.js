const { Op, fn, col } = require("sequelize");
const { Store, Rating } = require("../models");

exports.getStores = async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    const order = [];
    if (sortBy === "name") {
      order.push(["name", sortOrder === "desc" ? "DESC" : "ASC"]);
    } else if (sortBy === "address") {
      order.push(["address", sortOrder === "desc" ? "DESC" : "ASC"]);
    } else {
      order.push(["id", "ASC"]);
    }

    const stores = await Store.findAll({ where, order });

    const storeIds = stores.map((s) => s.id);

    if (storeIds.length === 0) {
      return res.json([]);
    }

    const overallRatings = await Rating.findAll({
      where: { store_id: storeIds },
      attributes: [
        "store_id",
        [fn("AVG", col("rating")), "avgRating"],
      ],
      group: ["store_id"],
      raw: true,
    });

    const userRatings = await Rating.findAll({
      where: { user_id: req.user.id, store_id: storeIds },
      raw: true,
    });

    const avgMap = {};
    overallRatings.forEach((r) => {
      avgMap[r.store_id] = parseFloat(r.avgRating || 0).toFixed(1);
    });

    const userRatingMap = {};
    userRatings.forEach((r) => {
      userRatingMap[r.store_id] = { id: r.id, rating: r.rating };
    });

    let formattedStores = stores.map((store) => ({
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      overallRating: avgMap[store.id] || "0.0",
      userRating: userRatingMap[store.id]?.rating ?? null,
      userRatingId: userRatingMap[store.id]?.id ?? null,
    }));

    if (sortBy === "overallRating") {
      const direction = sortOrder === "desc" ? -1 : 1;
      formattedStores = formattedStores.sort(
        (a, b) => (parseFloat(a.overallRating) - parseFloat(b.overallRating)) * direction
      );
    } else if (sortBy === "userRating") {
      const direction = sortOrder === "desc" ? -1 : 1;
      formattedStores = formattedStores.sort((a, b) => {
        const aRating = a.userRating ?? -1;
        const bRating = b.userRating ?? -1;
        return (aRating - bRating) * direction;
      });
    }

    res.json(formattedStores);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
