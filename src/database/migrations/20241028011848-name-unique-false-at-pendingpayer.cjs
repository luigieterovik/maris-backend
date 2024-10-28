'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('PendingPayer', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    })

    await queryInterface.changeColumn('Payer', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('PendingPayer', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    })

    await queryInterface.changeColumn('Payer', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    })
  },
}
