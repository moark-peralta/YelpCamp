if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/expressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/review');
const userRoutes = require('./routes/users');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL  || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,  
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(methodOverride('_method'));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

const scriptSrcUrls = [
  "https://unpkg.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://unpkg.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://*.thunderforest.com"
];
const fontSrcUrls = [];
const imgSrcUrls = [
  "'self'",
  "blob:",
  "data:",
  "https://unpkg.com/",
  "https://a.tile.openstreetmap.org/",
  "https://b.tile.openstreetmap.org/",
  "https://c.tile.openstreetmap.org/",
  "https://res.cloudinary.com/dmk65rs95/",
  "https://images.unsplash.com/",
  "https://*.thunderforest.com"
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: imgSrcUrls,
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

console.log('NODE_ENV:', process.env.NODE_ENV);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: process.env.SECRET || 'thisshouldbeabettersecret',
  touchAfter: 24 * 60 * 60,
});

store.on('error', function(e) {
  console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SECRET || 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// console.log('Session Config:', sessionConfig);

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//   console.log('Session ID:', req.sessionID);
//   store.get(req.sessionID, (err, session) => {
//     if (err) {
//       console.log('Error retrieving session:', err);
//     } else {
//       console.log('Session data from store:', session);
//     }
//     next();
//   });
// });

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

// app.get('/test-session', (req, res) => {
//   req.session.test = 'Session is working';
//   console.log('Session test:', req.session.test);
//   res.send('Session test complete');
// });

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no! Something Went Wrong!';
  res.status(statusCode).render('error', { err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
