'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders_Products', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    })

    await queryInterface.addColumn('Orders_Products', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders_Products', 'createdAt')
    
    await queryInterface.removeColumn('Orders_Products', 'updatedAt')
  },
}
