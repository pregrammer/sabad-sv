const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");


const get_all = async (req, res) => {
  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }
  // localhost:3500/field_of_studies/?page=1&limit=10
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  if (!page || !limit)
    return res.status(400).json({ message: "specify page and limit" });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};
  results.currentPage = page;
  let count;

  try {
    const [result1, fields1] = await connection.execute(
      "select count(*) as count from field_of_studies"
    );
    count = result1[0].count;
    results.totallPage = Math.ceil(result1[0].count / limit);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  try {
    const [result2, fields2] = await connection.execute(
      "select * from field_of_studies limit " + limit + " OFFSET " + startIndex
    );
    results.result = result2;
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  connection.end();

  if (endIndex < count) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  res.status(200).json(results);
};

const create_fos = (req, res) => {};

const update_fos = (req, res) => {};

const delete_fos = (req, res) => {};

module.exports = {
  get_all,
  create_fos,
  update_fos,
  delete_fos,
};
