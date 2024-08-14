import cron from 'node-cron'
import { Sequelize } from 'sequelize'
import config from '../../config/database'

const sequelize = new Sequelize(config.url)

const deleteOldRecords = async () => {
  try {
    const response = await sequelize.query(
      `DELETE FROM "PendingOrders" WHERE "createdAt" <= NOW() - INTERVAL '1 minute';`,
    )
    console.log(response)
    console.log('Registros antigos deletados com sucesso.')
  } catch (error) {
    console.error('Erro ao deletar registros:', error)
  }
}

cron.schedule('*/2 * * * *', () => {
  console.log('Executando tarefa agendada para deletar registros antigos')
  deleteOldRecords()
})
