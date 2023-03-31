const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const Note = require('../models/Notes')

//ROUTE 1 : Create a Note using: POST method "/api/notes/createNote". Require Authentication / Login
router.post('/createNote', [

    body('title', 'Title must be minimum 3 characters long!').isLength({ min: 3 }),             // title must be at least 3 chars long

    body('description', 'Description cannot be empty!').isLength({ min: 5 }),                   // description cannot be blank
], async (req, res) => {

    // Finds the validation errors in this request and wraps them in json object 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()[0].msg });
    }

    const { title, description, tag } = req.body;

    try {
        //grabs the Note's request body
        let note = Note(req.body);
        //creates a Note with required fields
        await Note.create({
            title: title,
            description: description,
            tag: tag
        })
        res.json({ note }) //sends a created note
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Some Internal Error Occurred') //catch internal errors
    }
})

module.exports = router;