import express from 'express';
import User from '../models/User';

import parseErrors from '../utils/parseErrors';
import { sendConfirmationEmail } from '../mailer';

const router = express.Router();

router.post('/', (req, res) => {
  
  const { email, password } = req.body.user;
  const user = new User({ email });

  user.setPassword(password);
  user.setConfirmationToken();
  
  user.save()
  .then(userRecord => {

    console.log('SENDING');
    sendConfirmationEmail(userRecord);
    console.log('SENT');
    res.json({ user: userRecord.toAuthJSON() })
    console.log('not appl');
  })
  .catch(err => {
    console.log('ERR', err)
    res.status(400).json({ errors: parseErrors(err.errors) })
  });
});

export default router;
