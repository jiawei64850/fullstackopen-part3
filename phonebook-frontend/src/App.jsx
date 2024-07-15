import { useState, useEffect } from 'react'
import personsServices from './services/persons.js'
import './index.css'
const Name = ({ name }) =>  <> {name} </>

const Number = ({ number }) =>  <> {number} </>

const Filter = ({wordFilter, handleFilterChange}) => {
  return (
  <>
    filter show with
    <input value={wordFilter} onChange={handleFilterChange} />
  </>
  )
}

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={type}>
      {message}
    </div>
  )
}


const PersonsForm = ({addPerson, newName, handleNameChange, newPhone, handlePhoneChange}) => {
  return (
  <form onSubmit={addPerson}>
    <div>name: 
      <input 
        value={newName}
        onChange={handleNameChange}
      />
    </div>
    <div>number: 
      <input
        value={newPhone}
        onChange={handlePhoneChange} 
      />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form >       
  )   
}

const Persons = ({personToShow, deletePerson}) => {
  console.log(personToShow);
  return (
  <>
    {personToShow.map(person =>
    <div key ={person.id}>
      <Name  name={person.name} />
      <Number number={person.number} />
      <button type='button' onClick={() => deletePerson(person.id)}>delete</button>
    </div>
    )} 
  </>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [wordFilter, setWordFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('');


  useEffect(() => {
    personsServices
    .getAll()
    .then(initialPersons => {
      setPersons(initialPersons)
    })
},[])






  const addPerson = (event) => {
    event.preventDefault()
    
    const nameObject = {
      name: newName,
      number: newPhone
    }

    const personWithSameName = persons.find(person => person.name === newName)
    console.log(personWithSameName)
    if (personWithSameName) {
      if (personWithSameName.number !== newPhone) {
        if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
          const changePerson = {...personWithSameName, number: newPhone}
          console.log(personWithSameName.id, changePerson)
          personsServices
          .update(personWithSameName.id, changePerson)
          .then(() => {
            return personsServices.getAll()
          })
          .then(initialPersons => {
            setPersons(initialPersons)
            setMessage(`the old number of ${newName} is replacing by new number: ${newPhone}`)
            setMessageType('success')
            setTimeout(() => {
              setMessage(null)
            }, 2000)
          })
          .catch(error => {
            console.log(error.response.data.error)
            if (error.response && error.response.data) {
              setMessage(`Failed to update the number for ${newName}: ${error.response.data.error}`);
            } else {
              setMessage(`Failed to update the number for ${newName}`);
            }
            setMessageType('error')
            setTimeout(() => {
              setMessage(null)
            }, 2000)
          })
        }
      }
      else {
        setMessage(`${newName} is already added to phonebook`)
        setMessageType('error')
        setTimeout(() => {
          setMessage(null)
        }, 2000)
      }
    }
    else {
      personsServices
      .create(nameObject)
      .then(createPersons => {
      setPersons(persons.concat(createPersons)) 
      setMessage(`Added ${newName} with number ${newPhone}`)
      setMessageType('success')
      setTimeout(() => {
        setMessage(null)
      }, 2000) 
      })
      .catch(error => {
        console.log(error.response.data.error)
        setMessage(`${error.response.data.error}`)
        setMessageType('error')
        setTimeout(() => {
          setMessage(null)
        }, 2000) 
      })
    }
    setNewName('')
    setNewPhone('')
  }

  const deletePerson = (id) => {
    console.log(id);
    const person = personToShow.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name} ?`)) {
      personsServices
      .remove(id)
      .then(() => {
      setPersons(persons.filter(person => person.id !== id))})
      setMessage(`'${person.name}' has removed from server`)
      setMessageType('success')
      setTimeout(() => {
        setMessage(null)
      }, 2000)
      .catch(error => {
        console.log(error.response.data.error)
        setMessage(
          `'${person.name}' has already removed from server`
        )
        setMessageType('error')
        setTimeout(() => {
          setMessage(null)
        }, 2000)
        setPersons(persons.filter(person => person.id !== id))
      })
    } 
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handlePhoneChange = (event) => {
    setNewPhone(event.target.value)
  }

  const handleFilterChange = (event) => {
    setWordFilter(event.target.value)
  }

  const personToShow = 
    wordFilter ? persons.filter(person => person.name.toLowerCase().includes(wordFilter.toLowerCase())) : persons
  
     
 


  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter 
        wordFilter={wordFilter} 
        handleFilterChange={handleFilterChange} 
        message={message}
        messageType={messageType} 
        />
      <h2>add a new</h2>
      <PersonsForm 
        addPerson={addPerson} 
        newName={newName} 
        handleNameChange={handleNameChange} 
        newPhone={newPhone} 
        handlePhoneChange={handlePhoneChange}
      />
      <h2>Numbers</h2>
      <Persons personToShow={personToShow} deletePerson={deletePerson}/>
    </div>
  )
}

export default App