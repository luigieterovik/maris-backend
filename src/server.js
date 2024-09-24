import app from './app'
import './database/scripts/deletePendingOrders'

const port = process.env.PORT || 3001

app.listen(port, '0.0.0.0', () => console.log('Server is running at port 3001'))
