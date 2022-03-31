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
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  if (!page || !limit)
    return res.status(400).json({ message: "specify page and limit" });

  const startIndex = (page - 1) * limit;

  const results = {};

  try {
    const [result1, fields1] = await connection.execute(
      "select count(*) as count from colleges"
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      "select * from colleges limit " + limit + " OFFSET " + startIndex
    );
    results.result = result2;
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
  res.status(200).json(results);
};

const create_college = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "نام دانشکده نیاز است" });

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  try {
    // check for duplicate name in the db
    const [result1, fields1] = await connection.execute(
      `select * from colleges where name='${name}'`
    );

    if (result1.length !== 0)
      return res.status(409).json({ message: "این نام قبلا وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `insert into colleges (name) values('${name}')`
    );

    res.status(201).json({ message: `دانشکده ی مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_college = async (req, res) => {
  const { name, id } = req.body;
  if (!name || !id) {
    return res
      .status(400)
      .json({ message: "نام و آیدی جدید دانشکده نیاز است" });
  }

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  try {
    // check for existing id in the db
    const [result1, fields1] = await connection.execute(
      `select * from colleges where id='${id}'`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "دانشکده ای مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `update colleges set name = '${name}' where id = '${id}'`
    );

    res.status(201).json({ message: `دانشکده ی مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_college = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی دانشکده نیاز است" });

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  try {
    // check for existing id in the db
    const [result1, fields1] = await connection.execute(
      `select * from colleges where id='${id}'`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "دانشکده ای مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from colleges where id = '${id}'`
    );

    res.status(200).json({ message: `دانشکده ی مورد نظر با موفقیت حذف شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

module.exports = {
  get_all,
  create_college,
  update_college,
  delete_college,
};
