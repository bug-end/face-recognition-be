import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const database = {
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

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = database.users.find((user) => user.email === email); // Find the user in the database by email
    if (!user) {
      return res.status(400).json('User not found');
    }
    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      res.json('success'); // Passwords match, user authenticated
    } else {
      res.status(400).json('Incorrect password'); // Passwords don't match, authentication failed
    }
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: '125',
      name: name,
      email: email,
      password: hashedPassword,
      entries: 0,
      joined: new Date(),
    };
    database.users.push(newUser);
    res.json(newUser);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(400).json('not found');
  }
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json('not found');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
