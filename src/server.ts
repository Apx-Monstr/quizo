import express from 'express';
import cors from "cors"
import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import dotenv from 'dotenv';
dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', quizRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
