'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Questionnaire extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Questionnaire.init({
    questionnaireId: DataTypes.INTEGER,
    criteria: DataTypes.STRING,
    question: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Questionnaire',
  });
  return Questionnaire;
};