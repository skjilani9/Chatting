const mongoose = require("mongoose");

const database = async () => {
  try {
    const conn = await mongoose.connect(process.env.MON_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = database;