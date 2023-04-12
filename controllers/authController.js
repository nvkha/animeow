const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const AppError = require('../utils/appError');

exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password
        });
        const resUser = {
            username: newUser.username,
            role: newUser.role
        }

        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: resUser
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            return next(new AppError("Please provide username and password!", 400));
        }

        const user = await User.findOne({
            username: username,
        }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError("Invalid username or password!", 401));
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

         // Remove password from output
        user.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: user
            }
        });
    } catch (err) {
        next(err);
    }
}

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please login to get access.', 401));
        }

        let decoded;
        try {
            decoded = await jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return next(new AppError('Invalid token or expires', 401));
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('The user belong to this token does no longer exists', 401));
        }

        req.user = user;
        next();
    } catch (err) {
        next(err)
    }
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action!', 403));
        }
        next();
    }
}

