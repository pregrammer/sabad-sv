const dbConfig = {
  host: "localhost",
  port: 3308,
  user: "root",
  password: "",
  database: "sabad",
};

module.exports = dbConfig;

/* const connection = require("./api/controllers/connection");

app.use("/", (req, res) => {
  const connection = require("./api/config/connection");
  connection.connect(function (err) {
    if (err) throw err;
    for (let i = 1; i < 59; i++) {
      connection.query(
        `INSERT INTO users (email, password, firstName, lastName, role, field_of_study_id) VALUES ('ali@yahoo.com${i}', 'skajlrw4we989s8dyf9ashfd9asy9d${i}', 'ali${i}', 'hosseini${i}', ${Math.floor(Math.random() * 4) + 1}, ${i})`,
        function (err, result, fields) {
          if (err) throw err;
          console.log(i);
        }
      );
    }

    connection.end(function (err) {
      if (err) {
        return console.log("error:" + err.message);
      }
      console.log("Close the database connection.");
    });
  });
}); */
