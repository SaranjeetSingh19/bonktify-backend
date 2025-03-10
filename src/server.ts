import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import songRoutes from './routes/songs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);

app.get('/', (req, res) => {
  res.send("Bonktify Backend API");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
