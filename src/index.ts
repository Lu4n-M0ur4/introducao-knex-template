import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`)
})

app.get('/ping', async (req: Request, res: Response) => {
  try {
    res.status(200).send({ message: 'Pong!' })
  } catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send('Erro inesperado')
    }
  }
})

app.get('/bands', async (req: Request, res: Response) => {
  try {
    const results = await db.raw(`SELECT * FROM bands`)

    res.status(200).send(results)
  } catch (error) {
    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send('Erro inesperado')
    }
  }
})

app.post('/bands', async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body

    if (!id || !name) {
      res.status(400)
     
      throw new Error('id ou name inválidos')
    }

    await db.raw(`INSERT INTO bands
    VALUES('${id}','${name}')
    `)

    res.status(201).send('Banda cadastrada com sucesso')
  } catch (error) {
    if (req.statusCode === 200) {
      res.status(500)
    }

    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.send('Erro inesperado')
    }
  }
})


app.put('/bands/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id

      const newId=req.body.newId
      const newName=req.body.newName

      if(newId !== undefined){
        if(typeof newId !== "string"){
            res.status(400)
            throw new Error("O id deve ser uma string")
        }
        if(newId.length < 3){
            res.status(400)
            throw new Error("O id deve ter tres caracteres")
        }
      }

      if(newName !== undefined){
        if(typeof newName !== "string"){
            res.status(400)
            throw new Error("O name deve ser uma string")
        }
        if(newName.length < 2){
            res.status(400)
            throw new Error("O name deve ter no minimo 2 caracteres")
        }
      }
  

      const [band] = await db.raw(`SELECT * FROM bands WHERE id ="${id}"`)

      if(band){
        await db.raw(`
        UPDATE bands SET 
        id="${newId || band.id}",name="${newName || band.name}"
        WHERE id="${id}"
        `)
      }else{
        res.status(400)
        throw new Error('Id não encontrado')
      }

      res.status(200).send('Edição realizada com sucesso')
     

     
    } catch (error) {
      if (req.statusCode === 200) {
        res.status(500)
      }
  
      if (error instanceof Error) {
        res.send(error.message)
      } else {
        res.send('Erro inesperado')
      }
    }
  })