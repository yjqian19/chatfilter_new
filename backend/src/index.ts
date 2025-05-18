import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { messageController } from './controllers/messageController';
import { topicController } from './controllers/topicController';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected');

  // Send message
  socket.on('sendMessage', async (data) => {
    try {
      const message = await messageController.createMessage(data);
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  });

  // Create new topic
  socket.on('createTopic', async (data) => {
    try {
      const topic = await topicController.createTopic(data);
      io.emit('newTopic', topic);
    } catch (error) {
      console.error('Failed to create topic:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
