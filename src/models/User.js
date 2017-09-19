import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    index: true, 
    unique: true },
  passwordHash: { type: String, required: true },
  confirmed: { type: Boolean, default: false },
  confirmationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' }
  }, 
  { timestamps: true }
);

schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
}

schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
}

schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/confirmation/${this.confirmationToken}`;
}

schema.methods.generateJWT = function generateJWT() {
  return jwt.sign({
    email: this.email,
    confirmed: this.confirmed
  }, process.env.JWT_SECRET);
};

schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    confirmed: this.confirmed,
    token: this.generateJWT()
  }
};

// TODO make the reset password flow more secure by 
// storing the token in the db and comparing
// encode the user id and an expiry into the token
schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
  return `${process.env.HOST}/reset_password/${this.resetPasswordToken}`;
};

schema.methods.setResetPasswordToken = function setResetPasswordToken() {
  this.resetPasswordToken = this.generateResetPasswordToken();
};

schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign({
      _id: this._id
    }, 
    process.env.JWT_SECRET,
    { "expiresIn": "1h" }
  );
};

schema.methods.sendPasswordChangedNotification = function sendPasswordChangedNotification() {

}

schema.plugin(uniqueValidator, { message: 'This email is already taken' });

export default mongoose.model('User', schema);
