const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET = 'secretTokenToFindAndSecureUsers';

//ROUTE 1 : Create a User using: POST method "/api/auth/". Doesn't require authentication
router.post('/createUser', [

    body('name', 'Please enter a valid name').isLength({ min: 3 }),           // username must be at least 3 chars long

    body('email', 'Please enter a valid email').isEmail(),                      // email must be an email

    body('password', 'Password must be minimum 5 characters').isLength({ min: 5 }),    // password must be at least 5 chars long
], async (req, res) => {

    const errors = validationResult(req);                           // Finds the validation errors in this request and wraps them in json object 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        let validUser = await User.findOne({ email: req.body.email })         //checks whether an user with this email already exists
        if (validUser) {
            return res.status(400).json({ error: `Sorry, a user with this credentials already exists!` })
        }

        //adds some salt on the password saved by any user -- 'bcrypt' library
        const salt = await bcrypt.genSalt(10);
        const securePass = await bcrypt.hash(req.body.password, salt);

        validUser = User(req.body);
        //creates a user with req fields
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePass,
        })

        //grabs the ID of user, signs it with 'jwt.sign' and returns authToken
        const data = {
            validUser: {
                id: validUser.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)

        // res.json(validUser)               //sends the user input login information

        res.json({ authToken })                  //sends user id as an auth token/json-web-token
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Some Internal Error Occurred')             //catch internal errors
    }

})

//ROUTE 2 : Authenticate a User with login credentials using: POST method "/api/auth/login". Doesn't require login, because you-are-just-loggin-in right now! :p
router.post('/login', [

    body('email', 'Please enter a valid email').isEmail(),               // email must be an email

    body('password', 'Password field cannot be blank').exists()         // password must match user's password and the field cant be empty
], async (req, res) => {

    // Finds the validation errors for login and wraps them in json object 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    //grabs the entered email and pass for login
    const { email, password } = req.body;

    try {
        //finds the user with entered email, if doesn't exists returns bad request with error message
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: `Sorry, please enter correct credentials!` })
        }

        //compares the entered password with the password user saved with, if doesn't match returns bad request with error message
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: `Sorry, please enter correct credentials!` })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        const message = "Logged in Successfully!";

        res.json({ authToken, message })            //sends user id as an auth token/json-web-token and logged in message

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Some Internal Error Occurred')        //catch internal errors
    }
})

//ROUTE 3 : Get User details using: GET method "/api/auth/getUser". Requires login.
router.get('/getUser', fetchUser, async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        res.send(user)

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Some Internal Error Occurred') //catch internal errors
    }
})

module.exports = router;