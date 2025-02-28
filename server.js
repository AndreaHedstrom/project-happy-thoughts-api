import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-happy-thoughts-api";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const { Schema } = mongoose

const HappyThoughtSchema = new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 120,
    trim: true
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

const HappyThoughts = mongoose.model("HappyThought", HappyThoughtSchema)

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

app.get("/thoughts", async (req, res) => {
  const happyThoughts = await HappyThoughts.find().sort({ createdAt: 'desc' }).limit(20)
  try {
    res.status(200).json({
      success: true,
      response: happyThoughts,
      message: "Some happy thoughts where found!"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Sorry, no happy thoughts here"
    })
  }
})

app.post("/thoughts", async (req, res) => {
  const { message } = req.body
  try {
    const newThought = await new Thought({ message }).save()
    res.status(201).json({
      success: true,
      response: newThought,
      message: "New thought posted"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Error, no thought where posted."
    })
  }
})

app.get("/thoughts/:thoughtId", async (req, res) => {
  const { thoughtId } = req.params
  try {
    const oneThought = await HappyThoughts.findById(thoughtId)
    res.status(200).json({
      success: true,
      response: oneThought,
      message: "Found the thought"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Sorry, not found."
    })
  }
})

app.patch("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params
  try {
    const newHeart = await HappyThought.findByIdUpdate(thoughtId, { $inc: { hearts: 1 } }, { new: true })
    res.status(201).json({
      success: true,
      response: newHeart,
      message: "New like!"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      response: error,
      message: "Sorry, could not update the like"
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
