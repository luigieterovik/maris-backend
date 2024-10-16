'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PendingOrders', 'deliveryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'PendingDelivery', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    await queryInterface.addColumn('Orders', 'deliveryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Delivery', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PendingOrders', 'deliveryId')

    await queryInterface.removeColumn('Orders', 'deliveryId')
  },
}
