"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handler_1 = require("../filehandling/handler");
const auth_1 = require("../middlewares/auth");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// Route to verify the users JWT
router.get('/verifyMe', auth_1.authenticateToken, (req, res) => {
    res.json({ message: "User verified", userid: req.user.userid });
});
// Route to add a New Quiz
router.post('/quizes', auth_1.authenticateToken, (req, res) => {
    var _a;
    const quizzes = (0, handler_1.readFile)('quizes.json');
    const users = (0, handler_1.readFile)('users.json');
    const { title, optionshuffleEnabled, questionshuffleEnabled, ques } = req.body;
    const newQuiz = { id: (0, uuid_1.v4)(), title, optionshuffleEnabled, questionshuffleEnabled, ques };
    quizzes.push(newQuiz);
    (0, handler_1.writeFile)('quizes.json', quizzes);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
    const userIndex = users.findIndex(user => user.userid === userId);
    if (userIndex !== -1) {
        users[userIndex].quizes.push(newQuiz.id);
        (0, handler_1.writeFile)('users.json', users);
    }
    res.json({ message: "Quiz added", id: newQuiz.id });
});
// Route to get all the quizes
router.get('/quizes', auth_1.authenticateToken, (req, res) => {
    const quizzes = (0, handler_1.readFile)('quizes.json');
    const user = (0, handler_1.readFile)('users.json').find((u) => u.userid === req.user.userid);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    const userQuizzes = quizzes.filter((quiz) => user.quizes.includes(quiz.id));
    res.json(userQuizzes);
});
// Route to get any specific quiz details
router.get('/quiz/:quizid', auth_1.authenticateToken, (req, res) => {
    // console.log(req.params)
    const quiz = (0, handler_1.readFile)('quizes.json').find((q) => q.id === req.params.quizid);
    if (!quiz)
        return res.status(404).json({ error: "Quiz not found" });
    // console.log(quiz)
    res.json(quiz);
});
// Route to get Quiz Titles along with Quiz id
router.get('/quizTitles', auth_1.authenticateToken, (req, res) => {
    const quizes = (0, handler_1.readFile)('quizes.json');
    const user = (0, handler_1.readFile)('users.json').find((u) => { var _a; return u.userid === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userid); });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const userQuizes = quizes.filter((quiz) => user.quizes.includes(quiz.id));
    const titles = userQuizes.map(quiz => ({
        qid: quiz.id,
        qtitle: quiz.title
    }));
    res.json(titles);
});
// Route to add a New Question to any Quiz
router.post('/addQuestion', auth_1.authenticateToken, (req, res) => {
    const { quizid, quesid, ques, options, correctOption } = req.body;
    const quizes = (0, handler_1.readFile)('quizes.json');
    const quiz = quizes.find((q) => q.id === quizid);
    if (!quiz)
        return res.status(404).json({ error: 'Quiz not found' });
    const newQuestion = {
        quesid: quesid,
        ques,
        options,
        correctOption
    };
    quiz.ques.push(newQuestion);
    (0, handler_1.writeFile)('quizes.json', quizes);
    res.json({ message: 'Question added successfully', question: newQuestion });
});
// Route to edit any Question of any quiz
router.put('/editQuestion', auth_1.authenticateToken, (req, res) => {
    const { quizid, questionid, ques, options, correctOption } = req.body;
    const quizes = (0, handler_1.readFile)('quizes.json');
    const quiz = quizes.find((q) => q.id === quizid);
    if (!quiz)
        return res.status(404).json({ error: 'Quiz not found' });
    const question = quiz.ques.find((q) => q.id === questionid);
    if (!question)
        return res.status(404).json({ error: 'Question not found' });
    question.ques = ques || question.ques;
    question.options = options || question.options;
    question.correctOption = correctOption || question.correctOption;
    (0, handler_1.writeFile)('quizes.json', quizes);
    res.json({ message: 'Question updated successfully', question });
});
// Route to delete any Specific Question of the Quiz
router.delete('/deleteQuestion', auth_1.authenticateToken, (req, res) => {
    const { quizid, questionid } = req.body;
    console.log(req.body);
    const quizes = (0, handler_1.readFile)('quizes.json');
    const quiz = quizes.find((q) => q.id === quizid);
    if (!quiz)
        return res.status(404).json({ error: 'Quiz not found' });
    quiz.ques = quiz.ques.filter((q) => q.id !== questionid);
    (0, handler_1.writeFile)('quizes.json', quizes);
    res.json({ message: 'Question deleted successfully' });
});
// Route to edit Title of the Quiz provided with <quizid>
router.put('/editTitle/:quizid', auth_1.authenticateToken, (req, res) => {
    const { quizid } = req.params;
    const { title } = req.body;
    const quizes = (0, handler_1.readFile)('quizes.json');
    const quiz = quizes.find((q) => q.id === quizid);
    if (!quiz)
        return res.status(404).json({ error: 'Quiz not found' });
    quiz.title = title;
    (0, handler_1.writeFile)('quizes.json', quizes);
    res.json({ message: 'Quiz title updated successfully', title });
});
// Route to delete any specific quiz
router.delete("/delete/:quizid", auth_1.authenticateToken, (req, res) => {
    const { quizid } = req.params;
    // Read existing quizzes and users
    const quizzes = (0, handler_1.readFile)('quizes.json');
    const users = (0, handler_1.readFile)('users.json');
    // Find the quiz to delete
    const quizIndex = quizzes.findIndex(quiz => quiz.id === quizid);
    if (quizIndex === -1) {
        return res.status(404).json({ message: "Quiz not found" });
    }
    // Remove the quiz from the quizzes array
    quizzes.splice(quizIndex, 1);
    (0, handler_1.writeFile)('quizes.json', quizzes);
    // Remove the quiz id from the user's quizzes
    users.forEach(user => {
        const quizIndexInUser = user.quizes.indexOf(quizid);
        if (quizIndexInUser !== -1) {
            user.quizes.splice(quizIndexInUser, 1);
        }
    });
    (0, handler_1.writeFile)('users.json', users);
    res.json({ message: "Quiz deleted successfully" });
});
exports.default = router;
