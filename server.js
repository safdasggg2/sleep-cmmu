const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let users = {};
let state = {
  members: [],
  setlists: [],
  schedules: [],
  memos: []
};

app.get('/api/state', (req, res) => {
  res.json({ state });
});

app.post('/api/state', (req, res) => {
  const next = req.body || {};
  state = {
    members: Array.isArray(next.members) ? next.members : [],
    setlists: Array.isArray(next.setlists) ? next.setlists : [],
    schedules: Array.isArray(next.schedules) ? next.schedules : [],
    memos: Array.isArray(next.memos) ? next.memos : []
  };
  res.json({ ok: true });
});

app.post('/api/signup', (req, res) => {
  const { id, pw, nick } = req.body || {};
  if (!id || !pw || !nick) {
    return res.status(400).json({ ok: false, message: '모든 항목을 입력해주세요.' });
  }
  if (String(id).trim().length < 2) {
    return res.status(400).json({ ok: false, message: '아이디는 2자 이상이어야 해요.' });
  }
  if (String(pw).length < 6) {
    return res.status(400).json({ ok: false, message: '비밀번호는 6자 이상이어야 해요.' });
  }
  if (users[id]) {
    return res.status(409).json({ ok: false, message: '이미 사용 중인 아이디예요.' });
  }

  const isAdmin = Object.keys(users).length === 0;
  users[id] = { id, pw, nick, isAdmin };

  res.json({
    ok: true,
    user: { id, nick, isAdmin }
  });
});

app.post('/api/login', (req, res) => {
  const { id, pw } = req.body || {};
  if (!id || !pw) {
    return res.status(400).json({ ok: false, message: '아이디와 비밀번호를 입력해주세요.' });
  }
  const user = users[id];
  if (!user) {
    return res.status(404).json({ ok: false, message: '존재하지 않는 아이디입니다.' });
  }
  if (user.pw !== pw) {
    return res.status(401).json({ ok: false, message: '비밀번호가 틀렸습니다.' });
  }

  res.json({
    ok: true,
    user: { id: user.id, nick: user.nick, isAdmin: user.isAdmin }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
