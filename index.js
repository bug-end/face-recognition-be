import express from 'express';

const port = 4000;
const app = express();
app.use(express.json());

const databse = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@test.com',
      password: 'cookies',
      entries: 0,
      joined: new Date(),
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@test.com',
      password: 'bananas',
      entries: 0,
      joined: new Date(),
    },
  ],
};

app.get('/', (req, res) => {
  res.send('success');
});

app.post('/signin', (req, res) => {
  if (req.body.email === databse.users[0].email && req.body.password === databse.users[0].password) {
    res.json('success');
  } else {
    res.status(400).json('error logging in');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
