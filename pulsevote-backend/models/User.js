const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
 
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
 
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
 
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
 
module.exports = mongoose.model("User", userSchema);