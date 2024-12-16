'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = bcrypt.hashSync('instructor123', 10); // Hash the password

    await queryInterface.bulkInsert('users', [{
      username: 'instructor',
      password: hashedPassword,
      userType: 'instructor',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'instructor' }, {});
  }
};
