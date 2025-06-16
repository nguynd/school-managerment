const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/authRoute");
const studentRoute = require("./routes/studentRoute");
const subjectRoute = require("./routes/subjectRoute");
const scoreRoute = require("./routes/scoreRoute");
const myScoreRoute = require("./routes/myScoreRoute");
const classRoute = require("./routes/classRoute");
const averageRoute = require("./routes/averageRoute");
const gradingRoute = require("./routes/gradingRoute");
const dashboardRoutes = require("./routes/dashboardRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/students", studentRoute);
app.use("/api/subjects", subjectRoute);
app.use("/api/scores", scoreRoute);
app.use("/api/my-scores", myScoreRoute);
app.use("/api/classes", classRoute);
app.use("/api/averages", averageRoute);
app.use("/api/gradings", gradingRoute);       
app.use("/api/grades", gradingRoute);          
app.use("/api", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("School management API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
