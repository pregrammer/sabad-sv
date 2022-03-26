const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
//const cookieParser = require('cookie-parser');

const corsOptions = require("./api/config/corsOptions");
const PORT = process.env.PORT || 3500;

// log requests info to the console
app.use(morgan("dev"));
// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));
// built-in middleware for json
app.use(express.json());
//middleware for cookies
//app.use(cookieParser());

// Routes which should handle requests
app.use("/field_of_studies", require("./api/routes/field_of_studies"));
app.use("/users", require("./api/routes/users"));

// route not found
app.all("*", (req, res) => {
  res.status(404).json({ error: "404 Not Found" });
});

// error handler
app.use((err, req, res, next) => {
  res.status(error.status || 500).send(err.message);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
