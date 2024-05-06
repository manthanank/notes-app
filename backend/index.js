const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: "*",
    })
);

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/notes', noteRoutes);

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});