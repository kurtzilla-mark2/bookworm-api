import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { sendResetPasswordEmail, sendResetPasswordNotificationEmail } from '../mailer';
import parseErrors from '../utils/parseErrors';

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
    { new :true } // causes the updated version of the user to be return to then...
  )
  .then(user => 
    user ? res.json({ user: user.toAuthJSON() }) : res.status(400).json({})
  )
  .catch(() =>
    res.status(400).json({error: { global: "That email does not exist" } })
  );
});

router.post('/reset_password_request', (req, res) => {
  User.findOne({ email: req.body.email })
  .then(user => {
    if(user && user.confirmed === true ) {
      user.setResetPasswordToken();
      user.save()
      .then(() => {
        sendResetPasswordEmail(user);
        res.json({});
      });
    } else if (user && user.confirmed !== true ) {
      res.status(400).json({ errors: { global: "Please confirm your email "}})
    } else {
      res.status(400).json({ errors: { global: "User does not exist"}})
    }
  });
});

router.post('/validate_reset_password_token', (req, res) => {
  const { token } = req.body;
  if(token) {    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {      
      if(err) {
        res.status(401).json({});
      } else {        
        User.findOne({ resetPasswordToken: token })
        .then(user => {
          // we now have a verified token - ensure it matches what is on our db
          if(user && decoded && user._id.toString() === decoded._id.toString()){
            res.json({});
          } else {
            res.status(401).json({ errors: { global: "invalid token"} });
          }
        });        
      }
    });
  } else {
    res.status(401).json({ errors: { global: "invalid token"} });
  }
});

router.post('/reset_password', (req, res) => {
  const { password, token } = req.body.data;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(err) {
      res.status(401).json({ errors: { global: "invalid token-"} })
    } else {     
      User.findOne({ _id: decoded._id }).then(user => {
        if(user) {
          user.setPassword(password);
          user.resetPasswordToken = '';
          user.save()
          .then(() => { 
            sendResetPasswordNotificationEmail(user);
            res.json({})
          })
          .catch(err => res.status(404).json({ errors: { global: parseErrors(err.errors) } }));
        } else {
          res.status(404).json({ errors: { global: "invalid token+"} })
        }
      });
    }
  });
});

export default router;
