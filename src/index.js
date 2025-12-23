// this is the entry point of the application
import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";

// get the port from environment variables or use default
const PORT = process.env.PORT || 8080;

// connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running up at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
    process.exit(1);
  });
