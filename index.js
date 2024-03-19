import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import knex from 'knex';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  },
});

app.get('/', (req, res) => {
  res.send('success');
});

app.post('/signin', async (req, res) => {
  try {
    const data = await db.select('email', 'hash').from('login').where('email', '=', req.body.email);

    if (data.length === 0) {
      return res.status(400).json('wrong credentials');
    }

    const isValid = await bcrypt.compare(req.body.password, data[0].hash);

    if (isValid) {
      const user = await db.select('*').from('users').where('email', '=', req.body.email);
      if (user.length === 0) {
        return res.status(400).json('unable to get user');
      }
      res.json(user[0]);
    } else {
      res.status(400).json('wrong credentials');
    }
  } catch (err) {
    res.status(400).json('wrong credentials');
  }
});

app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  const hash = await bcrypt.hash(password, 10);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        db('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('not found');
      }
    })
    .catch((err) => res.status(400).json('unable to get user'));
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json('unable to get entries'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
