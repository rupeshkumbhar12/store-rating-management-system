require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const { User, Store, Rating } = require("./models");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Store Rating API is running" });
});

const seedAdmin = async () => {
  const bcrypt = require("bcryptjs");
  const adminExists = await User.findOne({ where: { email: "admin@store.com" } });

  if (!adminExists) {
    await User.create({
      name: "System Administrator Account",
      email: "admin@store.com",
      address: "123 Admin Street, City Center",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
    });
    console.log("Default admin created: admin@store.com / Admin@123");
  }
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("Database synced");

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
