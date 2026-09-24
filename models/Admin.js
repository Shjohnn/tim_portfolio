const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

adminSchema.statics.hash = (password) => bcrypt.hash(password, 12);
adminSchema.methods.check = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = model('Admin', adminSchema);
