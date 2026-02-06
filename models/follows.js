import  mongoose  from "mongoose";

const followsSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, 
  },
);

const Follows = mongoose.model("Follows", followsSchema);

export default Follows;
