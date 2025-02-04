'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Payer', 'updatedAt')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payer', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },
}
