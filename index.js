import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { rooms, generateRoomCode } from './data.js';
import { getRandomQuestions } from './questions.js';

const app = express();
app.use(
  cors({
    origin: 'https://roommatch-frontend.vercel.app',
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('RoomMatch backend is running.');
});

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
    matchResults: {},
  };

  res.status(201).json({ roomCode });
});

app.post('/rooms/:code/join', (req, res) => {
  const { code } = req.params;
  const { name, gender, lookingFor } = req.body;

  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  const userId = uuidv4();
  const user = {
    userId,
    name,
    gender,
    lookingFor,
    answers: {},
    matchedWith: null,
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

  const user = room.participants.find((p) => p.userId === userId);
  if (!user) return res.status(404).json({ error: 'User not found in this room.' });

  user.answers = answers;

  const allAnswered = room.participants.every(
    (p) => Object.keys(p.answers).length === room.questionSet.length
  );

  if (room.participants.length === room.size && allAnswered) {
    room.state = 'countdown';

    const participants = room.participants;
    const questionIds = room.questionSet.map((q) => q.id);
    const weights = {};
    room.questionSet.forEach((q) => (weights[q.id] = q.weight || 1));

    const scores = [];
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const a = participants[i];
        const b = participants[j];

        const compatible =
          (a.lookingFor === b.gender || a.lookingFor === 'any') &&
          (b.lookingFor === a.gender || b.lookingFor === 'any');

        if (!compatible) continue;

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

app.get('/rooms/:code/status', (req, res) => {
  const { code } = req.params;
  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ state: room.state });
});

app.get('/rooms/:code/match/:userId', (req, res) => {
  const { code, userId } = req.params;
  const room = rooms[code];
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const matchId = room.matchResults[userId];
  if (!matchId) return res.status(404).json({ error: 'Match not found for user' });

  const matchedUser = room.participants.find((p) => p.userId === matchId);
  if (!matchedUser) return res.status(404).json({ error: 'Matched user not found' });

  res.status(200).json({ matchName: matchedUser.name });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
