const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let users = [
  { id: 1, username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, username: 'user', password: 'user', role: 'user' },
];

const SECRET_KEY = 'your_secret_key';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ message: 'Špatné přihlašovací údaje' });

  const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, username: user.username });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ message: 'Uživatel již existuje' });
  }

  const newUser = { id: users.length + 1, username, password, role: 'user' };
  users.push(newUser);
  res.status(201).json({ message: 'Registrován úspěšně' });
});

app.get('/content/:page', authenticateToken, (req, res) => {
  const { page } = req.params;
  if (page === 'admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Přístup odepřen' });
  }
  res.json({ message: `Jste na stránce ${page}` });
});

app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));
