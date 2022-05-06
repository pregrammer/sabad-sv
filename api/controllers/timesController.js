const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_all = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const forSelect = req.query.forSelect;
  if ((!page || !limit) && !forSelect)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای دریافت زمان ها ناقص است" });

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  const startIndex = (page - 1) * limit;

  const results = {};

  try {
    if (forSelect === "true") {
      const [result1, fields1] = await connection.execute(
        `select * from times`
      );
      return res.status(200).json(result1);
    }

    const [result1, fields1] = await connection.execute(
      "select count(*) as count from times"
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      "select * from times order by id desc limit " +
        limit +
        " OFFSET " +
        startIndex
    );
    results.result = result2;
    res.status(200).json(results);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const create_time = async (req, res) => {
  const { start, end } = req.body.data;
  if (!start || !end)
    return res.status(400).json({ message: "مشخصات برای ثبت زمان ناقص است" });

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
    // check for duplicate start and end time in the db
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from times where start = ${start} and end = ${end}`
    );

    if (result1[0].count !== 0)
      return res.status(409).json({ message: "این زمان قبلا وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `insert into times (start, end) values(${start}, ${end})`
    );

    res.status(201).json({ message: `زمان مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_time = async (req, res) => {
  const { id, start, end } = req.body.data;
  if (!id || !start || !end)
    return res
      .status(400)
      .json({ message: "مشخصات برای ویرایش زمان ناقص است" });

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
    const [result0, fields0] = await connection.execute(
      `select count(*) as count from times where id = ${id}`
    );

    if (result0[0].count === 0)
      return res
        .status(400)
        .json({ message: "زمانی مطابق با آیدی ارسالی وجود ندارد" });

    // check for duplicate start and end time in the db
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from times where start = ${start} and end = ${end} and id <> ${id}`
    );

    if (result1[0].count !== 0)
      return res.status(409).json({ message: "این زمان قبلا وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `update times set start = ${start}, end = ${end} where id = ${id}`
    );

    res.status(201).json({ message: `زمان مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_time = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی زمان نیاز است" });

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
      `select count(*) as count from times where id = ${id}`
    );

    if (result1[0].count === 0)
      return res
        .status(400)
        .json({ message: "زمانی مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from times where id = ${id}`
    );

    res.status(200).json({ message: `زمان مورد نظر با موفقیت حذف شد` });
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
  create_time,
  update_time,
  delete_time,
};
