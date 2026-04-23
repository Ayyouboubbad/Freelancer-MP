const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['client', 'freelancer', 'admin'],
      default: 'client',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    country: { type: String, default: '' },
    languages: [{ type: String }],
    skills: [{ type: String }],

    // Freelancer-specific
    xp: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ['beginner', 'pro', 'expert'],
      default: 'beginner',
    },
    totalEarnings: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    responseTime: { type: String, default: '' },

    // Availability
    isAvailable: { type: Boolean, default: true },

    // Status / moderation
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    // Wishlist (gig IDs saved by client)
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gig' }],

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Refresh token rotation
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// ─── Hash password before save ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Compare password ─────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Recalculate level from XP ───────────────────────────────────────────────
userSchema.methods.recalculateLevel = function () {
  if (this.xp >= 500) this.level = 'expert';
  else if (this.xp >= 100) this.level = 'pro';
  else this.level = 'beginner';
};

module.exports = mongoose.model('User', userSchema);
