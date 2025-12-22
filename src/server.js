const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db.js");
const User = require("./models/User.js");

dotenv.config();

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        username: 'admin',
        password_hash: process.env.ADMIN_PASSWORD,
        email: 'MoyaBabushkaKuritTrubku',
        role: 'admin'
      });
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const port = process.env.PORT || 3000;

connectDB().then(async () => {
  await seedDatabase();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});
