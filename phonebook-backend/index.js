require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())


morgan.token('body', function (req) { return JSON.stringify(req.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))



app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => { Person
  .find( { $and: [ { name: { $exists: true } }, { number: { $exists: true } } ] } )
  .then(fetchPerson => { response.json(fetchPerson) })
})


app.get('/api/info', (request, response) => {
  const date = new Date().toString()
  response.send(`<p>Phonebook has info for ${ Person.length } people</p>
        <p>${ date }</p>`)
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if(result) {
        response.status(204).end() }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    'name': body.name,
    'number': body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatePerson => {
      if (updatePerson.number) return response.json(updatePerson)
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = new Person({
    'name': body.name,
    'number': body.number
  })

  Person.findOne({
    $and: [{ name: body.name }, { number: body.number }]
  }).then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({
        error: 'name must be unique'
      })
    } else {
      return person.save()
    }
  }).then(savedPerson => {
    if (savedPerson) {
      response.json(savedPerson)
    }
  }).catch(error => {
    next(error)
  })
})

const unknownEndpoint = (request, response) => { response.status(404).send({ error: 'unknown endpoint' }) }

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(404).send({ error: 'malfotmatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})