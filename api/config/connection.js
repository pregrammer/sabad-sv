const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "",
  database: "sabad",
});

module.exports = connection;




/* const connection = require("./api/controllers/connection");

connection.connect(function (err) {
  if (err) throw err;
  connection.query("select * from users", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

  connection.end(function (err) {
    if (err) {
      return console.log("error:" + err.message);
    }
    console.log("Close the database connection.");
  });
}); */
