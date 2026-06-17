const bcrypt = require("bcryptjs");
const { Op, fn, col } = require("sequelize");
const { User, Store, Rating } = require("../models");
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require("../utils/validation");

const buildUserFilters = (query) => {
  const where = {};
  const { name, email, address, role, sortBy, sortOrder } = query;

  if (name) where.name = { [Op.like]: `%${name}%` };
  if (email) where.email = { [Op.like]: `%${email}%` };
  if (address) where.address = { [Op.like]: `%${address}%` };
  if (role) where.role = role;

  const order = [];
  if (sortBy === "name") {
    order.push(["name", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else if (sortBy === "email") {
    order.push(["email", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else if (sortBy === "address") {
    order.push(["address", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else if (sortBy === "role") {
    order.push(["role", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else {
    order.push(["id", "ASC"]);
  }

  return { where, order };
};

const buildStoreFilters = (query) => {
  const where = {};
  const { name, email, address, sortBy, sortOrder } = query;

  if (name) where.name = { [Op.like]: `%${name}%` };
  if (email) where.email = { [Op.like]: `%${email}%` };
  if (address) where.address = { [Op.like]: `%${address}%` };

  const order = [];
  if (sortBy === "name") {
    order.push(["name", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else if (sortBy === "email") {
    order.push(["email", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else if (sortBy === "address") {
    order.push(["address", sortOrder === "desc" ? "DESC" : "ASC"]);
  } else {
    order.push(["id", "ASC"]);
  }

  return { where, order };
};

const attachStoreRatings = async (stores) => {
  const storeIds = stores.map((store) => store.id);
  if (storeIds.length === 0) return stores;

  const overallRatings = await Rating.findAll({
    where: { store_id: storeIds },
    attributes: ["store_id", [fn("AVG", col("rating")), "avgRating"]],
    group: ["store_id"],
    raw: true,
  });

  const avgMap = {};
  overallRatings.forEach((rating) => {
    avgMap[rating.store_id] = parseFloat(rating.avgRating || 0).toFixed(1);
  });

  return stores.map((store) => {
    const plain = store.toJSON ? store.toJSON() : store;
    return {
      ...plain,
      rating: avgMap[store.id] || "0.0",
    };
  });
};

exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    const errors = [];
    const nameError = validateName(name);
    const addressError = validateAddress(address);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (nameError) errors.push(nameError);
    if (addressError) errors.push(addressError);
    if (emailError) errors.push(emailError);
    if (passwordError) errors.push(passwordError);
    if (!role || !["ADMIN", "USER", "OWNER"].includes(role)) {
      errors.push("Role must be ADMIN, USER, or OWNER");
    }

    if (errors.length > 0) {
      return res.status(400).json({ msg: "Validation failed", errors });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      address,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { where, order } = buildUserFilters(req.query);

    const users = await User.findAll({
      where,
      order,
      attributes: { exclude: ["password"] },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const result = user.toJSON();

    if (user.role === "OWNER") {
      const store = await Store.findOne({ where: { owner_id: user.id } });
      if (store) {
        const avgResult = await Rating.findOne({
          where: { store_id: store.id },
          attributes: [[fn("AVG", col("rating")), "avgRating"]],
          raw: true,
        });
        result.store = {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
        };
        result.rating = avgResult?.avgRating
          ? parseFloat(avgResult.avgRating).toFixed(1)
          : "0.0";
      } else {
        result.rating = null;
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ msg: "Name, email, and address are required" });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ msg: emailError });
    }

    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== "OWNER") {
        return res.status(400).json({ msg: "Invalid store owner" });
      }
    }

    const store = await Store.create({
      name,
      email,
      address,
      owner_id: ownerId || null,
    });

    res.status(201).json({
      msg: "Store created successfully",
      store,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getStores = async (req, res) => {
  try {
    const { where, order } = buildStoreFilters(req.query);

    const stores = await Store.findAll({
      where,
      order,
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    let formattedStores = await attachStoreRatings(stores);

    if (req.query.sortBy === "rating") {
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
      formattedStores = formattedStores.sort(
        (a, b) => (parseFloat(a.rating) - parseFloat(b.rating)) * sortOrder
      );
    }

    res.json(formattedStores);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};
