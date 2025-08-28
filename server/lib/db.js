import mongoose, { Mongoose } from "mongoose";

export const ConnectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("database connected")
    );
    await mongoose.connect(`${process.env.MONGO_URI}`);
  } catch (error) {
    console.log(error);
  }
};
