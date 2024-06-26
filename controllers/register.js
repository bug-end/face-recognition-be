const isValidEmail = (email) => {
  const emailRegex = /^.+?@.+?\..+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  return passwordRegex.test(password);
};

export const handleRegister = async (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;

  // Basic validation to check for missing fields
  if (!email || !name || !password) {
    return res.status(400).json('incorrect form submission');
  }

  // Email validation
  if (!isValidEmail(email)) {
    return res.status(400).json('invalid email or password format');
  }

  // Password validation
  if (!isValidPassword(password)) {
    return res.status(400).json('invalid email or password format');
  }

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
};
