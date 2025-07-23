const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const { rooms, generateRoomCode } = require('./data');
app.post('/rooms', (req, res) => {
  const roomCode = generateRoomCode();

  rooms[roomCode] = {
    roomCode,
    state: 'waiting', // can be: waiting, answering, countdown, matched
    createdAt: new Date(),
    participants: [],
    questionSet: [],
    matchResults: {}
  };

  res.status(201).json({ roomCode });
});


const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('RoomMatch Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
