'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PendingOrders', 'pendingDeliveryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'PendingDelivery', key: 'id' },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PendingOrders', 'pendingDeliveryId')
  },
}
