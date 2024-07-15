import axios from 'axios'
const baseUrl = '/api/persons'

const getAll = () => {
    return axios.get(baseUrl).then(request => request.data)
}

const create = nameObject => {
    return axios.post(baseUrl, nameObject).then(request => request.data)
}

const remove = id => {
    return axios.delete(`${baseUrl}/${id}`).then(request => request.data)
}

const update = (id, nameObject) => {
    return axios.put(`${baseUrl}/${id}`, nameObject).then(request => request.data)
}
export default {getAll, create, remove, update}