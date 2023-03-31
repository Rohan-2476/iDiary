const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secretTokenToFindAndSecureUsers'

fetchUser = (req, res, next) => {
    //Gets the User with auth-token in the Header of request and add ID to request object
    const token = req.header('auth-token')
    if (!token) {
        return res.status(401).send({ error: 'Please authenticate with a valid auth-token' })
    }

    try {
        //verify the token and return User data
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next() //runs the next async function after this middleware(fetchUser)
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate with a valid auth-token' })
    }

}

module.exports = fetchUser