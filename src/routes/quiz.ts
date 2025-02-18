import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';
import Quiz, { IQuiz } from '../models/Quiz';
import User from '../models/User';

const router = express.Router();

// Route to verify the users JWT
router.get('/verifyMe', authenticateToken, (req: AuthRequest, res: Response): void => {
  res.json({ message: "User verified", userid: req.user!.userid });
});

// Route to add a New Quiz
router.post('/quizes', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, optionshuffleEnabled, questionshuffleEnabled, ques } = req.body;
    const userId = req.user?.userid;

    // Create new quiz with unique ID
    const quizId = uuidv4();
    const newQuiz = new Quiz({
      id: quizId,
      title,
      optionshuffleEnabled,
      questionshuffleEnabled,
      ques: ques || []
    });

    await newQuiz.save();

    // Add quiz ID to user's quizzes array
    await User.findOneAndUpdate(
      { userid: userId },
      { $push: { quizes: quizId } }
    );

    res.json({ message: "Quiz added", id: quizId });
  } catch (error) {
    console.error('Error adding quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all the quizes
router.get('/quizes', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userid;

    // Find user to get their quiz IDs
    const user = await User.findOne({ userid: userId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find all quizzes that belong to the user
    const userQuizzes = await Quiz.find({ id: { $in: user.quizes } });
    res.json(userQuizzes);
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get any specific quiz details
router.get('/quiz/:quizid', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.quizid });
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error getting quiz details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get Quiz Titles along with Quiz id
router.get('/quizTitles', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userid;

    // Find user to get their quiz IDs
    const user = await User.findOne({ userid: userId });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Find all quizzes that belong to the user and select only id and title
    const userQuizzes = await Quiz.find(
      { id: { $in: user.quizes } },
      { id: 1, title: 1, _id: 0 }
    );

    const titles = userQuizzes.map(quiz => ({
      qid: quiz.id,
      qtitle: quiz.title
    }));

    res.json(titles);
  } catch (error) {
    console.error('Error getting quiz titles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to add a New Question to any Quiz
router.post('/addQuestion', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizid, quesid, ques, options, correctOption } = req.body;

    const newQuestion = {
      quesid: quesid || uuidv4(),
      ques,
      options,
      correctOption
    };

    const quiz = await Quiz.findOneAndUpdate(
      { id: quizid },
      { $push: { ques: newQuestion } },
      { new: true }
    );

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to edit any Question of any quiz
router.put('/editQuestion', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizid, questionid, ques, options, correctOption } = req.body;

    const quiz = await Quiz.findOne({ id: quizid });
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const questionIndex = quiz.ques.findIndex(q => q.quesid === questionid);
    if (questionIndex === -1) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    // Update the question fields
    if (ques) quiz.ques[questionIndex].ques = ques;
    if (options) quiz.ques[questionIndex].options = options;
    if (correctOption !== undefined) quiz.ques[questionIndex].correctOption = correctOption;

    await quiz.save();

    res.json({
      message: 'Question updated successfully',
      question: quiz.ques[questionIndex]
    });
  } catch (error) {
    console.error('Error editing question:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to delete any Specific Question of the Quiz
router.delete('/deleteQuestion', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizid, questionid } = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { id: quizid },
      { $pull: { ques: { quesid: questionid } } },
      { new: true }
    );

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to edit Title of the Quiz provided with <quizid>
router.put('/editTitle/:quizid', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizid } = req.params;
    const { title } = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { id: quizid },
      { title },
      { new: true }
    );

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({ message: 'Quiz title updated successfully', title });
  } catch (error) {
    console.error('Error updating quiz title:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to delete any specific quiz
router.delete("/delete/:quizid", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizid } = req.params;

    // Find and delete the quiz
    const result = await Quiz.findOneAndDelete({ id: quizid });
    if (!result) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Remove quiz ID from user's quizzes array
    await User.updateMany(
      { quizes: quizid },
      { $pull: { quizes: quizid } }
    );

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;