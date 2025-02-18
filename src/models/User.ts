import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  userid: string;
  email: string;
  fname: string;
  lname: string;
  passhash: string;
  quizes: string[]; // Array of quiz IDs
}

const UserSchema: Schema = new Schema({
  userid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  passhash: { type: String, required: true },
  quizes: { type: [String], default: [] }
});

export default mongoose.model<IUser>('User', UserSchema);