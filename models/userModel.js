const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide username!'],
        unique: true,
        minlength: 6,
        maxlength: 20
    },
    role: {
        type: String,
        enum: ['staff', 'admin'],
        default: 'staff'
    },
    password: {
        type: String,
        required: [true, 'Please provide password!'],
        select: false,
        minlength: 8,
        maxlength: 128
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (inputPassword, dbPassword) {
    return await bcrypt.compare(inputPassword, dbPassword);
}

const User = mongoose.model('User', userSchema);

module.exports = User;