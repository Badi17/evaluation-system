module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {   // Add this line
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {});

  return User;
};
