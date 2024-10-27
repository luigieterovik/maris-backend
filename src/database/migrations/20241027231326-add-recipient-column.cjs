'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PendingPayer', 'recipient', {
      type: Sequelize.STRING,
      allowNull: false,
    })

    await queryInterface.addColumn('Payer', 'recipient', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('PendingPayer', 'recipient')

    await queryInterface.removeColumn('Payer', 'recipient')
  },
}
