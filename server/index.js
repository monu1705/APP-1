
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import bankRoutes from './routes/banks.js';

/*
--- HOW TO RUN THE BACKEND ---
1. Make sure you have Node.js installed (version 14+ recommended).
2. Open a terminal in this 'server' directory.
3. Run 'npm install' to install all the required packages from package.json.
4. Run 'npm start' to start the server.
5. The server will be running on http://localhost:3001 and will create a 'db.json' file to store data.
*/

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/banks', bankRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
