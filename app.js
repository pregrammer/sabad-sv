const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { requireAuth } = require("./api/middlewares/authMiddlewares");
const credentials = require("./api/middlewares/credentials");

const corsOptions = require("./api/config/corsOptions");
const PORT = process.env.PORT || 3500;

// log requests info to the console
app.use(morgan("dev"));
// for setting cookie in fronend
app.use(credentials);
// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));
// built-in middleware for json
app.use(express.json());
//middleware for cookies
app.use(cookieParser());

// Routes which should handle requests
///////////////////////////
app.use("/auth", require("./api/routes/authRoutes"));
app.use("*", requireAuth);
app.use("/field_of_studies", require("./api/routes/field_of_studiesRoutes"));
app.use("/users", require("./api/routes/usersRoutes"));
app.use("/messages", require("./api/routes/messagesRoutes"));
app.use("/colleges", require("./api/routes/collegesRoutes"));
app.use("/times", require("./api/routes/timesRoutes"));
app.use("/professors", require("./api/routes/professorsRoutes"));
app.use("/classes", require("./api/routes/classesRoutes"));
app.use("/courses", require("./api/routes/coursesRoutes"));
app.use("/semesters", require("./api/routes/semestersRoutes"));
app.use("/schedules", require("./api/routes/schedulesRoutes"));

// route not found
app.all("*", (req, res) => {
  res.status(404).json({ message: "404 Not Found" });
});

// error handler
app.use((err, req, res, next) => {
  res.status(error.status || 500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
