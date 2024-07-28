const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas');
const ExpressError = require('../utils/expressError');
const {cloudinary}= require('../cloudinary')
const { getGeoCoordinates } = require('../utils/showMap')




// Middleware functions
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};



module.exports.index = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Number of campgrounds per page
    const skip = (page - 1) * limit;

    const allCampgrounds = await Campground.find({});
    const campgrounds = await Campground.find({}).skip(skip).limit(limit);
    const totalCampgrounds = await Campground.countDocuments({});

    res.render("campgrounds/index", {
        campgrounds,
        allCampgrounds,
        currentPage: page,
        totalPages: Math.ceil(totalCampgrounds / limit)
    });
};



module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}




module.exports.createCampgrounds = async (req, res, next) => {
    try {
        const address = req.body.campground.location;
        console.log('Location:', address);

        const { lat, lon } = await getGeoCoordinates(address);
        console.log('Coordinates:', { lat, lon });

        if (!lat || !lon) {
            throw new Error('Invalid coordinates');
        }

        const campground = new Campground({
            ...req.body.campground,
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        });

        console.log('Campground data before save:', campground);

        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        console.log('Images:', campground.images);

        campground.author = req.user._id;
        await campground.save();

        req.flash('success', 'Successfully made a campground');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        console.error('Error creating campground:', error);
        req.flash('error', `Could not create campground: ${error.message}`);
        res.redirect('/campgrounds');
    }
};


module.exports.renderCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.editCampground = async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = req.body.campground.location;
        const { lat, lon } = await getGeoCoordinates(address);

        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        });
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs);

        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        }

        await campground.save();
        req.flash('success', 'Successfully updated campground');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        req.flash('error', 'Could not update campground');
        res.redirect(`/campgrounds/${req.params.id}/edit`);
    }
};


module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect("/campgrounds");
}
