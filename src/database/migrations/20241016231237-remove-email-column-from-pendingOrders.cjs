'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PendingOrders', 'email')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('PendingOrders', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },
}
