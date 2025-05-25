import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, //couldinary url
      require: true,
    },
    thumbnail: {
      type: String, //couldinary url
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    duration: {
      type: Number,
      require: true,
    },
    viwes:{
        tyep:Number,
        default:0,

    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
  },
  { timestamps:true }
);

videoSchema.plugin(mongooseAggregatePaginate)//agreegate 

export const Video=mongoose.model("Video",videoSchema)