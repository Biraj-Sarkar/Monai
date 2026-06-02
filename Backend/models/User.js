import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 2,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    },
    minLength: 8
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String,
    default: ""
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lifestyleTag: {
    type: [String],
    default: []
  },
  avgMonthlySpend: {
    type: Number,
    default: 0
  },
  preferredCategories: [
    {
      type: String
    }
  ]
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', UserSchema);

export default User;