import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://rajputrounak08_db_user:quizapp123@cluster0.0gykhmt.mongodb.net/QuizApp?retryWrites=true&w=majority',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("DB CONNECTED");
  } catch (err) {
    console.error("DB CONNECTION ERROR:", err);
    process.exit(1); // Exit if DB connection fails
  }
};
