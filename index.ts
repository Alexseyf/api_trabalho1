import express from 'express'
import routesNotebooks from './routes/notebooks'

const app = express()
const port = 3000

app.use(express.json())

app.use("/notebooks", routesNotebooks)

app.get('/', (req, res) => {
  res.send('API de Cadastro de Notebooks')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})