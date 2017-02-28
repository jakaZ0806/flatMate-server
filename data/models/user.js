/**
 * Created by Lukas on 14-Dec-16.
 */
import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    username: {type: String, unique: true},
    password: String,
    admin: Boolean,
    firstName: String,
    lastName: String,
    friends: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User' , unique: true}],
    statusMessage: String,
});

export default mongoose.model('User', userSchema);