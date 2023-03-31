const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        tag: {
            type: String,
            default: 'General'
        },
        description: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }

);

const Note = mongoose.model('notes', NotesSchema);
module.exports = Note;