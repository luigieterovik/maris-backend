'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PendingOrders', 'deliveryId')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('PendingOrders', 'deliveryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'PendingDelivery', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },
}
