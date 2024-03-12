'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'subTotal', {
      type: Sequelize.DECIMAL,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Orders', 'subTotal')
  },
}
