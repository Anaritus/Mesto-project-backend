import { model, Schema } from 'mongoose';
import { urlValidate } from '../util';

interface IUser {
  name: string;
  about: string;
  avatar: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },
    about: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
    },
    avatar: {
      type: String,
      validate: urlValidate,
      required: true,
    },
  },
  { versionKey: false },
);

export default model<IUser>('user', userSchema);
