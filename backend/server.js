import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/connectDB.js";
import channelRouter from "./routes/channelRouter.js";
import userRouter from "./routes/userRouter.js";
import videoRouter from "./routes/videoRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/channels", channelRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

const PORT = process.env.PORT || 5000;

// Connect to the database, then start the server.
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server: ", error.message);
        process.exit(1);
    }
};

startServer();
