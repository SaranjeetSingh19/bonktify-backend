import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import songRoutes from './routes/songs';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the Vercel frontend
const allowedOrigins = ['https://bonktify.vercel.app', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      // Allow requests with no origin (like Postman) or from allowed origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

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
