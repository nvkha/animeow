const mongoose = require('mongoose');

const parameterSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'Parameter must have a name!']
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Parameter must have a value!'],
    }
});

const Parameter = mongoose.model('Parameter', parameterSchema);

module.exports = Parameter;