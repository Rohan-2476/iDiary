const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Note = require("../models/Notes");
const fetchUser = require("../middleware/fetchUser");

//ROUTE 1 : Create a Note using: POST method "/api/notes/createNote". Require Authentication / Login
router.post(
  "/createNote",
  fetchUser,
  [
    body("title", "Title must be minimum 3 characters long!").isLength({
      min: 3,
    }), // title must be at least 3 chars long

    body("description", "Description cannot be empty!").isLength({ min: 5 }), // description cannot be blank
  ],
  async (req, res) => {
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
      const savedNote = await Note.create({
        title,
        description,
        tag,
        user_ID: req.user.id,
      });
      res.json({ savedNote }); //sends a created note
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some Internal Error Occurred"); //catch internal errors
    }
  }
);

//ROUTE 2 : Fetch all Notes using: GET method "/api/notes/fetchallnotes". Require Authentication / Login
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    // fetches all notes associated with the requested user id and sends it in response
    const notes = await Note.find({ user_ID: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some Internal Error Occurred"); //catch internal errors
  }
});

//ROUTE 3 : Update an existing Note using: PUT method "/api/notes/updatenote/:id". Require Authentication / Login
router.put(
  "/updatenote/:id",
  fetchUser,
  [
    body("title", "Title must be minimum 3 characters long!").isLength({
      min: 3,
    }), // title must be at least 3 chars long

    body("description", "Description cannot be empty!").isLength({ min: 5 }), // description cannot be blank
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // Create a newNote object
      const newNote = {};

      // update only what's being updated
      if (title) {
        newNote.title = title;
      }
      if (description) {
        newNote.description = description;
      }
      if (tag) {
        newNote.tag = tag;
      }

      // Find the note to be updated and update it {by note id}
      let note = await Note.findById(req.params.id);
      // if no note exists with such id
      if (!note) {
        return res.status(404).json({ message: "Note not found!" });
      }

      // if user_ID associated with the note doesn't match
      if (note.user_ID.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ message: "Not authorized to update the note!" });
      }

      // fire the update note querry
      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json({ updatedNote: note });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some Internal Error Occurred"); //catch internal errors
    }
  }
);

//ROUTE 4 : Delete an existing Note using: DELETE method "/api/notes/deletenote/:id". Require Authentication / Login
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // Find the note to be deleted and delete it {by note id}
    let note = await Note.findById(req.params.id);
    // if no note exists with such id
    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    // if user_ID associated with the note doesn't match
    if (note.user_ID.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete the note!" });
    }

    // fire the delete note querry
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({
      message: "Note has been deleted successfully!",
      deletedNote: note,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some Internal Error Occurred"); //catch internal errors
  }
});
module.exports = router;
