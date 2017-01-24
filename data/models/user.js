/**
 * Created by Lukas on 14-Dec-16.
 */
import mongoose from 'mongoose';

export default mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
    admin: Boolean,
    firstName: String,
    lastName: String,
    id: Number
}));