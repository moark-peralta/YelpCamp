const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgrounds = require('../controller/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { storage } = require('../cloudinary');
const multer = require('multer');

const upload = multer({ storage });
    
router.route('/')
    .get(campgrounds.index)
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgrounds.createCampgrounds));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.renderCampground))
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
