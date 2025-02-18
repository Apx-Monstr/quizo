"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const uuid_1 = require("uuid");
const Quiz_1 = __importDefault(require("../models/Quiz"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Route to verify the users JWT
router.get('/verifyMe', auth_1.authenticateToken, (req, res) => {
    res.json({ message: "User verified", userid: req.user.userid });
});
// Route to add a New Quiz
router.post('/quizes', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, optionshuffleEnabled, questionshuffleEnabled, ques } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
        // Create new quiz with unique ID
        const quizId = (0, uuid_1.v4)();
        const newQuiz = new Quiz_1.default({
            id: quizId,
            title,
            optionshuffleEnabled,
            questionshuffleEnabled,
            ques: ques || []
        });
        yield newQuiz.save();
        // Add quiz ID to user's quizzes array
        yield User_1.default.findOneAndUpdate({ userid: userId }, { $push: { quizes: quizId } });
        res.json({ message: "Quiz added", id: quizId });
    }
    catch (error) {
        console.error('Error adding quiz:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to get all the quizes
router.get('/quizes', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userid;
        // Find user to get their quiz IDs
        const user = yield User_1.default.findOne({ userid: userId });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Find all quizzes that belong to the user
        const userQuizzes = yield Quiz_1.default.find({ id: { $in: user.quizes } });
        res.json(userQuizzes);
    }
    catch (error) {
        console.error('Error getting quizzes:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to get any specific quiz details
router.get('/quiz/:quizid', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quiz = yield Quiz_1.default.findOne({ id: req.params.quizid });
        if (!quiz) {
            res.status(404).json({ error: "Quiz not found" });
            return;
        }
        res.json(quiz);
    }
    catch (error) {
        console.error('Error getting quiz details:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to get Quiz Titles along with Quiz id
router.get('/quizTitles', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userid;
        // Find user to get their quiz IDs
        const user = yield User_1.default.findOne({ userid: userId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Find all quizzes that belong to the user and select only id and title
        const userQuizzes = yield Quiz_1.default.find({ id: { $in: user.quizes } }, { id: 1, title: 1, _id: 0 });
        const titles = userQuizzes.map(quiz => ({
            qid: quiz.id,
            qtitle: quiz.title
        }));
        res.json(titles);
    }
    catch (error) {
        console.error('Error getting quiz titles:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to add a New Question to any Quiz
router.post('/addQuestion', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizid, quesid, ques, options, correctOption } = req.body;
        const newQuestion = {
            quesid: quesid || (0, uuid_1.v4)(),
            ques,
            options,
            correctOption
        };
        const quiz = yield Quiz_1.default.findOneAndUpdate({ id: quizid }, { $push: { ques: newQuestion } }, { new: true });
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json({ message: 'Question added successfully', question: newQuestion });
    }
    catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to edit any Question of any quiz
router.put('/editQuestion', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizid, questionid, ques, options, correctOption } = req.body;
        const quiz = yield Quiz_1.default.findOne({ id: quizid });
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
        if (ques)
            quiz.ques[questionIndex].ques = ques;
        if (options)
            quiz.ques[questionIndex].options = options;
        if (correctOption !== undefined)
            quiz.ques[questionIndex].correctOption = correctOption;
        yield quiz.save();
        res.json({
            message: 'Question updated successfully',
            question: quiz.ques[questionIndex]
        });
    }
    catch (error) {
        console.error('Error editing question:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to delete any Specific Question of the Quiz
router.delete('/deleteQuestion', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizid, questionid } = req.body;
        const quiz = yield Quiz_1.default.findOneAndUpdate({ id: quizid }, { $pull: { ques: { quesid: questionid } } }, { new: true });
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to edit Title of the Quiz provided with <quizid>
router.put('/editTitle/:quizid', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizid } = req.params;
        const { title } = req.body;
        const quiz = yield Quiz_1.default.findOneAndUpdate({ id: quizid }, { title }, { new: true });
        if (!quiz) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        res.json({ message: 'Quiz title updated successfully', title });
    }
    catch (error) {
        console.error('Error updating quiz title:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
// Route to delete any specific quiz
router.delete("/delete/:quizid", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quizid } = req.params;
        // Find and delete the quiz
        const result = yield Quiz_1.default.findOneAndDelete({ id: quizid });
        if (!result) {
            res.status(404).json({ message: "Quiz not found" });
            return;
        }
        // Remove quiz ID from user's quizzes array
        yield User_1.default.updateMany({ quizes: quizid }, { $pull: { quizes: quizid } });
        res.json({ message: "Quiz deleted successfully" });
    }
    catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ error: 'Server error' });
    }
}));
exports.default = router;
