require('dotenv').config();
const mongoose = require("mongoose");
const axios = require("axios");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// 

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 500; i++) {
    console.log(`${i + 1}`)
    const price = Math.floor(Math.random() * 30) + 10;
    const random1000 = Math.floor(Math.random() * 1000);
    // const image = await getRandomPhoto();
    const camp = new Campground({
      author: '669761b812780631d49af08c',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, saepe eum. Saepe mollitia cum nemo ipsam, cupiditate ut, beatae nostrum quibusdam suscipit reiciendis tenetur unde. Possimus accusantium eaque voluptate libero.",
      price,
      images: [
        {
  
          url: 'https://res.cloudinary.com/dmk65rs95/image/upload/v1721381276/YelpCamp/p6zzcnxicay1rc2xewpa.jpg',
          filename: 'YelpCamp/p6zzcnxicay1rc2xewpa'
        },
        {
  
          url: 'https://res.cloudinary.com/dmk65rs95/image/upload/v1721381277/YelpCamp/nv5mmw9q4larhoc3p6rp.webp',
          filename: 'YelpCamp/nv5mmw9q4larhoc3p6rp'
        }
      ],
      geometry: {
        type:"Point",
        coordinates: [cities[random1000].longitude, 
                      cities[random1000].latitude],
      }
    })
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
