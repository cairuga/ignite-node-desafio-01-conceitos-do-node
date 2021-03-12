const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { request, response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.get("username");

  if (!username) return response.status(400).json({error: "no username param"});

  if (!users.some(user => user.username === username)) return response.status(404).json({error: "username not found"});

  next();
  
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  if (users.some(user => user.username === username)) {
    return response.status(400).json({error: "Username already exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);
  response.status(201).json(user);
});

app.get('/users', (request, response)=>{
  response.json(users);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const username = request.get("username");
  const user = users.find(user => user.username === username);
  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const username = request.get("username");

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const user = users.find(user => user.username === username);
  user.todos.push(todo);


  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const username = request.get("username");
  const id = request.params.id
  const {title, deadline} = request.body;
  const user = users.find(user => user.username === username);
  const todos = user.todos;

  if (todo = todos.find(todo => todo.id === id)) {
    todo.title = title;
    todo.deadline = new Date(deadline);
    return response.status(201).json(todo);
  } else response.status(404).json({error: "to-do not found"});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const username = request.get("username");
  const id = request.params.id
  const user = users.find(user => user.username === username);
  const todos = user.todos;

  if (todo = todos.find(todo => todo.id === id)) {
    todo.done = true;
    return response.status(201).json(todo);
  } else response.status(404).json({error: "to-do not found"});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const username = request.get("username");
  const id = request.params.id
  const user = users.find(user => user.username === username);
  const todos = user.todos;

  if (todo = todos.find(todo => todo.id === id)) {
    todos.pop(todo);
    return response.status(204).send();
  } else response.status(404).json({error: "to-do not found"});
});

module.exports = app;