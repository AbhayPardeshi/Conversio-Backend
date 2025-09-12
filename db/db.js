import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGO_URI;

export const connectDB = async () => {
  await connect(mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
    .then(() => console.log("connected to db!"))
    .catch((e) => console.dir(e));
};

