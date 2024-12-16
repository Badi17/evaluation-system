'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = bcrypt.hashSync('student123', 10); // Hash the password

    await queryInterface.bulkInsert('users', [{
      username: 'student',
      password: hashedPassword,
      userType: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'student' }, {});
  }
};
