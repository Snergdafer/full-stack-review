const bcrypt = require('bcrypt');

module.exports = {
    register: async (req, res) => {
        const db = req.app.get('db');
        const { email, password, username } = req.body;
        console.log("body: ", req.body)
        const foundUser = await db.check_user(email);
        if(foundUser[0]){
            return res.status(400).send("User already exists. Please login");
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const [newUser] = await db.add_user([email, username, hash]);
        // delete newUser.password
        // req.session.user = newUser
        req.session.user = {
            userId: newUser.user_id,
            email: newUser.email,
            username: newUser.username
        }
        res.status(200).send(req.session.user)
    },
    login: async(req, res) => {
        const db = req.app.get('db');
        const { email, password } = req.body;
        const [foundUser] = await db.check_user(email);
        if (!foundUser) {
            return res.status(401).send("Incorrect login information");
        }
        const authenticated = bcrypt.compareSync(password, foundUser.password);
        if ( authenticated ) {
            req.session.user = {
                userId: foundUser.user_id,
                email: foundUser.email,
                username: foundUser.username
            }
            res.status(200).send(req.session.user)
        } else {
            res.status(401).send("Incorrect login information")
        }
    }
}