import mongoose, { Schema, Document } from 'mongoose';

interface IQuestion {
  quesid: string;
  ques: string;
  options: string[];
  correctOption: number;
}

export interface IQuiz extends Document {
  id: string;
  title: string;
  optionshuffleEnabled: boolean;
  questionshuffleEnabled: boolean;
  ques: IQuestion[];
}

const QuestionSchema: Schema = new Schema({
    quesid: { type: String, required: true },
    ques: { type: String, required: true },
    options: { 
      type: Map, 
      of: String, 
      required: true 
    },
    correctOption: { type: String, required: true }
});
  

const QuizSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  optionshuffleEnabled: { type: Boolean, default: false },
  questionshuffleEnabled: { type: Boolean, default: false },
  ques: { type: [QuestionSchema], default: [] }
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);