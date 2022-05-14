const { response } = require("express");
const { request } = require("express");
const express = require('express');
const { v4: uuidv4 } = require('uuid');


const app = express();


app.use(express.json());

const users = []

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers

    const user = users.find(user => user.username == username)
    if (!user) {
        return response.status(400).json({ err: "Esté usuário não encontrado!" })
    }
    request.user = user
    return next()
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;
    const userNameExiste = users.some((user) => user.username == username)

    if (userNameExiste) {
        return response.status(400).json({ err: "Nome de usuário já existe!" })
    }
    users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
    })
    return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request
    return response.json(user)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body
    const { user } = request
    const addTodos = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }
    user.todos.push(addTodos)

    return response.status(201).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.query
    const { deadline, title } = request.body
    const { user } = request
    const todo = user.todos.find(todo => todo.id == id)
    todo.title = title
    todo.deadline = deadline
    return response.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { id } = request.query
    const { done } = request.query
    const { user } = request
    const todo = user.todos.find(todo => todo.id == id)
    todo.done = done
    return response.status(201).send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id } = request.query
    const { user } = request
    const verifyId = users.some(u => u.id == id)
    if (!verifyId) {
        return response.status(400).json({ err: "ID inválido!" })
    }
    users.splice(user, 1)

    return response.status(200).json(users)
});

app.listen(3333);