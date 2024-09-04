const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const regex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        'Please provide a valid email',
      ],
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
      validate: {
        validator: function (el) {
          console.log(regex.test(el), el);
          return regex.test(el);
        },
        message:
          'Minimum eight and maximum 15 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
      },
    },
    // oldPassword: {
    //   type: String,
    //   select: false,
    //   //   validate: {
    //   //     validator : function (el) {
    //   //       return el !== this.password
    //   //     },
    //   //     message: 'Old and New passwords are the same!'
    //   // },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
      select: false,
    },
    loginAtempts: {
      type: Number,
      default: 0,
    },
    lockedOutTime: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetToken: String,
    passwordResetExpires: Date,

    // active: {
    //   type: Boolean,
    //   default: true,
    //   select: false,
    // },
    // phoneNumber: {
    //   type: Number,
    //   minLength: []
    // },
  },
  {
    timestamps: true,
  },

  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.oldPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew)
    return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.increaseLoginAttempts = function () {
  if (this.loginAtempts >= 5) {
    this.lockedOutTime = Date.now() + 10 * 60 * 1000;
  }
  this.loginAtempts++;
};

userSchema.methods.resetLoginAttempts = function () {
  this.loginAtempts = 0;
};

userSchema.methods.isLockedOut = function () {
  if (this.lockedOutTime > Date.now()) {
    return true;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);

const User = mongoose.model('User', userSchema);

module.exports = User;
