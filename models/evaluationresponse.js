'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EvaluationResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EvaluationResponse.init({
    evaluationId: DataTypes.INTEGER,
    questionId: DataTypes.INTEGER,
    response: DataTypes.TINYINT
  }, {
    sequelize,
    modelName: 'EvaluationResponse',
  });
  return EvaluationResponse;
};