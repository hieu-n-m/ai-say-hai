const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/winston');
const http = require('http');
const WebSocket = require('ws');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('API is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/requests', require('./routes/request'));
app.use('/api/reports', require('./routes/report'));

// Error Handling Middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        console.log('Received:', message);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
