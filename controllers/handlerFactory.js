const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findOneAndDelete(
            {_id: req.params.id}
        );

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (err) {
        next(err);
    }
}

exports.updateOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findOneAndUpdate({_id: req.params.id}, req.body, {
            new: true,
            runValidators: true
        });

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: doc
        });
    } catch (err) {
        next(err);
    }
}

exports.createOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: doc
        });
    } catch (err) {
        next(err);
    }
}

exports.getOne = (Model, popOptions) => async (req, res, next) => {
    try {
        let query = Model.findById(req.params.id);

        if (popOptions) {
            query.populate(popOptions);
        }
        const doc = await query;
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: doc
        });
    } catch (err) {
        next(err);
    }
}

exports.getAll = Model => async (req, res, next) => {
    try {
        const features = new APIFeatures(Model.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const doc = await features.query
        res.status(200).json({
            status: 'success',
            data: doc
        });
    } catch (err) {
        next(err);
    }
}