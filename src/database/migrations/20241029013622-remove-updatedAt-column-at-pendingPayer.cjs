'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PendingPayer', 'updatedAt')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('PendingPayer', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    })
  },
}
