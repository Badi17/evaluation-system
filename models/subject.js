'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Subject.init({
    yearLevel: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    subjectName: DataTypes.STRING,
    description: DataTypes.TEXT,
    unit: DataTypes.INTEGER,
    time: DataTypes.STRING,
    day: DataTypes.STRING,
    isLab: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Subject',
  });
  return Subject;
};