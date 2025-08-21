'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      'PendingPayer',
      'PendingPayer_name_key',
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('PendingPayer', {
      fields: ['name'],
      type: 'unique',
      name: 'PendingPayer_name_key',
    })
  },
}
