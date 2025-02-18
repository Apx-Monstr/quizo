import express, { Response } from 'express';
import { readFile, writeFile } from '../filehandling/handler';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Route to verify the users JWT
router.get('/verifyMe', authenticateToken, (req: AuthRequest, res: Response):void => {
    res.json({ message: "User verified", userid: req.user!.userid });
});

// Route to add a New Quiz
router.post('/quizes', authenticateToken, (req: AuthRequest, res: Response) => {
    const quizzes = readFile('quizes.json');
    const users = readFile('users.json');
    const { title, optionshuffleEnabled, questionshuffleEnabled, ques } = req.body;

    const newQuiz = { id: uuidv4(), title, optionshuffleEnabled, questionshuffleEnabled, ques };
    quizzes.push(newQuiz);
    writeFile('quizes.json', quizzes);

    const userId = req.user?.userid;

    const userIndex = users.findIndex(user => user.userid === userId);
    if (userIndex !== -1) {
        users[userIndex].quizes.push(newQuiz.id);
        writeFile('users.json', users);
    }

    res.json({ message: "Quiz added", id: newQuiz.id });
});

// Route to get all the quizes
router.get('/quizes', authenticateToken, (req: AuthRequest, res: Response):any => {
    const quizzes = readFile('quizes.json');
    const user = readFile('users.json').find((u) => u.userid === req.user!.userid);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userQuizzes = quizzes.filter((quiz) => user.quizes.includes(quiz.id));
    res.json(userQuizzes);
});

// Route to get any specific quiz details
router.get('/quiz/:quizid', authenticateToken, (req: AuthRequest, res: Response):any => {
    // console.log(req.params)
    const quiz = readFile('quizes.json').find((q) => q.id === req.params.quizid);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    // console.log(quiz)
    res.json(quiz);
});

// Route to get Quiz Titles along with Quiz id
router.get('/quizTitles', authenticateToken, (req:AuthRequest, res:Response):any =>{
    const quizes = readFile('quizes.json');
    const user = readFile('users.json').find((u)=>u.userid === req.user?.userid);
    if(!user) return res.status(404).json({error:'User not found'});
    const userQuizes = quizes.filter((quiz)=> user.quizes.includes(quiz.id));
    const titles = userQuizes.map(quiz=>({
        qid:quiz.id,
        qtitle:quiz.title
    }));
    res.json(titles);
})

// Route to add a New Question to any Quiz
router.post('/addQuestion', authenticateToken, (req: AuthRequest, res: Response):any => {
    const { quizid, quesid, ques, options, correctOption } = req.body;
    const quizes = readFile('quizes.json');
    
    const quiz = quizes.find((q: any) => q.id === quizid);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    
    const newQuestion = {
        quesid: quesid,
        ques,
        options,
        correctOption
    };
    quiz.ques.push(newQuestion);
    writeFile('quizes.json', quizes);
    res.json({ message: 'Question added successfully', question: newQuestion });
});

// Route to edit any Question of any quiz
router.put('/editQuestion', authenticateToken, (req: AuthRequest, res: Response):any => {
    const { quizid, questionid, ques, options, correctOption } = req.body;
    const quizes = readFile('quizes.json');
    
    const quiz = quizes.find((q: any) => q.id === quizid);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    
    const question = quiz.ques.find((q: any) => q.id === questionid);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    question.ques = ques || question.ques;
    question.options = options || question.options;
    question.correctOption = correctOption || question.correctOption;
    
    writeFile('quizes.json', quizes);
    res.json({ message: 'Question updated successfully', question });
});

// Route to delete any Specific Question of the Quiz
router.delete('/deleteQuestion', authenticateToken, (req: AuthRequest, res: Response):any => {
    const { quizid, questionid } = req.body;
    console.log(req.body)
    const quizes = readFile('quizes.json');
    
    const quiz = quizes.find((q: any) => q.id === quizid);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    
    quiz.ques = quiz.ques.filter((q: any) => q.id !== questionid);
    
    writeFile('quizes.json', quizes);
    res.json({ message: 'Question deleted successfully' });
});

// Route to edit Title of the Quiz provided with <quizid>
router.put('/editTitle/:quizid', authenticateToken, (req: AuthRequest, res: Response):any => {
    const { quizid } = req.params;
    const { title } = req.body;
    const quizes = readFile('quizes.json');
    
    const quiz = quizes.find((q: any) => q.id === quizid);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    
    quiz.title = title;
    writeFile('quizes.json', quizes);
    res.json({ message: 'Quiz title updated successfully', title });
});

// Route to delete any specific quiz
router.delete("/delete/:quizid", authenticateToken, (req: AuthRequest, res: Response): any => {
    const { quizid } = req.params;
    
    // Read existing quizzes and users
    const quizzes = readFile('quizes.json');
    const users = readFile('users.json');
    
    // Find the quiz to delete
    const quizIndex = quizzes.findIndex(quiz => quiz.id === quizid);
    
    if (quizIndex === -1) {
        return res.status(404).json({ message: "Quiz not found" });
    }
    
    // Remove the quiz from the quizzes array
    quizzes.splice(quizIndex, 1);
    writeFile('quizes.json', quizzes);

    // Remove the quiz id from the user's quizzes
    users.forEach(user => {
        const quizIndexInUser = user.quizes.indexOf(quizid);
        if (quizIndexInUser !== -1) {
            user.quizes.splice(quizIndexInUser, 1);
        }
    });
    writeFile('users.json', users);

    res.json({ message: "Quiz deleted successfully" });
});

export default router;