const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Store = sequelize.define(
  "Store",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING(100),
    email: DataTypes.STRING(100),
    address: DataTypes.STRING(400),
    owner_id: DataTypes.INTEGER,
  },
  {
    tableName: "stores",
    timestamps: false,
  }
);

module.exports = Store;
