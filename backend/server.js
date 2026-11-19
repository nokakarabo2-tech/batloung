require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/db');
const routes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Batloung Farm API running on http://localhost:${port}`);
  await testConnection(); // logs a clear message; the server keeps running either way
});

// Safety net: log instead of crashing
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e.message));
process.on('uncaughtException', (e) => console.error('Uncaught exception:', e.message));
