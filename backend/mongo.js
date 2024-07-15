const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://karwailau64850:${password}@cluster0.mbgwfxq.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4]
})

if (person.name && person.number) {
  person.save().then(result => {
    if(result) return console.log(`add ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('Phonebook:')
  Person
    .find( { $and: [ { name: { $exists: true } }, { number: { $exists: true } } ] } )
    .then(persons => { persons.forEach(person => {
      console.log(`${ person.name } ${ person.number }`)
    })
    mongoose.connection.close()
    })
}



