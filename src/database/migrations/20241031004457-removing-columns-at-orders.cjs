'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'productId')
    await queryInterface.removeColumn('Orders', 'quantity')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
    await queryInterface.addColumn('Orders', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
    })
  },
}
