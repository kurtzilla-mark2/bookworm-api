import express from 'express';
import User from '../models/User';

const router = express.Router();

router.post('/', (req, res) => {
  const { credentials } = req.body;

  User.findOne({ email: credentials.email })
  .then(user => {
    if(user && user.isValidPassword(credentials.password)) {
      res.json({ user: user.toAuthJSON() });
    } else {
      res.status(400).json({ errors: { global: "Invalid credentials" }});
    }
  });
});

router.post('/confirmation', (req, res) => {
  const token = req.body.token;

  User.findOneAndUpdate(
    { confirmationToken: token },
    { confirmationToken: "", confirmed: true },
    { new :true } //causes the updated version of the user to be return to then...
  )
  .then(user => 
    user ? res.json({ user: user.toAuthJSON() }) : RES.STATS(400).JSON({})
  );
});

export default router;
