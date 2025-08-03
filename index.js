// index.js (roommatch-backend)

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { rooms, generateRoomCode } = require('./data');
const { getRandomQuestions } = require('./questions');

const app = express();
app.use(
  cors({
    origin: "https://roomatch-frontend.vercel.app/", // your Vercel URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('RoomMatch Backend is running.');
});

// Create room with optional size
app.post('/rooms', (req, res) => {
  const roomCode = generateRoomCode();
  const size = req.body.size || 2;

  rooms[roomCode] = {
    roomCode,
    size,
    state: 'waiting',
    createdAt: new Date(),
    participants: [],
    questionSet: [],
    matchResults: {}
  };

  res.status(201).json({ roomCode });
});

app.post('/rooms/:code/join', (req, res) => {
  const { code } = req.params;
  const { name } = req.body;

  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  const userId = uuidv4();
  const user = {
    userId,
    name,
    answers: {},
    matchedWith: null
  };

  room.participants.push(user);

  res.status(200).json({ userId, roomCode: code });
});

app.post('/rooms/:code/questions', (req, res) => {
  const { code } = req.params;
  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  const questions = getRandomQuestions(8);
  room.questionSet = questions;

  res.status(200).json({ questions });
});

app.get('/rooms/:code/questions', (req, res) => {
  const { code } = req.params;
  const room = rooms[code];
  if (!room || room.questionSet.length === 0) {
    return res.status(404).json({ error: 'Questions not assigned yet.' });
  }
  res.status(200).json({ questions: room.questionSet });
});

app.post('/rooms/:code/answers', (req, res) => {
  const { code } = req.params;
  const { userId, answers } = req.body;
  const room = rooms[code];

  if (!room) return res.status(404).json({ error: 'Room not found.' });
  const user = room.participants.find(p => p.userId === userId);
  if (!user) return res.status(404).json({ error: 'User not found in this room.' });
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Answers are required.' });

  user.answers = answers;

  const allAnswered = room.participants.every(
    p => Object.keys(p.answers).length === room.questionSet.length
  );

  if (room.participants.length === room.size && allAnswered) {
    room.state = 'countdown';
    const participants = room.participants;
    const questionIds = room.questionSet.map(q => q.id);
    const weights = {};
    room.questionSet.forEach(q => (weights[q.id] = q.weight || 1));

    const scores = [];
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const a = participants[i];
        const b = participants[j];
        let score = 0;
        for (let qid of questionIds) {
          score += weights[qid] * Math.abs((a.answers[qid] || 0) - (b.answers[qid] || 0));
        }
        scores.push({ a: a.userId, b: b.userId, score });
      }
    }

    const matched = new Set();
    const matchResults = {};
    scores.sort((x, y) => x.score - y.score);
    for (let pair of scores) {
      if (!matched.has(pair.a) && !matched.has(pair.b)) {
        matched.add(pair.a);
        matched.add(pair.b);
        matchResults[pair.a] = pair.b;
        matchResults[pair.b] = pair.a;
      }
    }
    room.matchResults = matchResults;
  }

  res.status(200).json({ message: 'Answers submitted successfully.' });
});

// Get room state (for frontend to know when to countdown)
app.get('/rooms/:code/status', (req, res) => {
  const { code } = req.params;
  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found.' });
  res.json({ state: room.state });
});

// Reveal the matched user's name
app.get('/rooms/:code/match/:userId', (req, res) => {
  const { code, userId } = req.params;
  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const matchId = room.matchResults[userId];
  if (!matchId) return res.status(404).json({ error: 'Match not found for user' });

  const matchedUser = room.participants.find(p => p.userId === matchId);
  if (!matchedUser) return res.status(404).json({ error: 'Matched user not found' });

  res.status(200).json({ matchName: matchedUser.name });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
