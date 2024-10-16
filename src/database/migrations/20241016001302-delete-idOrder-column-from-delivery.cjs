'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Delivery', 'idOrder')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Delivery', 'idOrder', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },
}
