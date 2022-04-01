const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_all_by_filter = async (req, res) => {
  const { college_id, hasProjector, capacity } = req.body;
  if (!college_id || hasProjector === undefined || !capacity)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای فیلتر کردن کلاس ها ناقص است" });

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

  let where_clause = " where ";

  if (college_id !== "all") {
    where_clause += `college_id=${college_id}`;
  }
  if (hasProjector !== "all") {
    if (where_clause.length > 7) {
      where_clause += ` and hasProjector=${hasProjector}`;
    } else {
      where_clause += `hasProjector=${hasProjector}`;
    }
  }
  if (capacity !== "all") {
    let clause = "";
    switch (capacity) {
      case 30:
        clause = "capacity < 30";
        break;
      case 3050:
        clause = "capacity between 30 and 50";
        break;
      case 50:
        clause = "capacity > 50";
        break;
      default:
        break;
    }
    if (where_clause.length > 7) {
      where_clause += ` and ${clause}`;
    } else {
      where_clause += `${clause}`;
    }
  }

  if (where_clause.length === 7) {
    where_clause = "";
  }

  try {
    const [result1, fields1] = await connection.execute(
      "select count(*) as count from classes" + where_clause
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select classes.id, classes.title, classes.capacity, classes.hasProjector, college_id, colleges.name as college_name from classes join colleges on classes.college_id=colleges.id${where_clause} order by classes.id desc limit ${limit} OFFSET ${startIndex}`
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

const create_class = async (req, res) => {
  const { title, college_id, capacity, hasProjector } = req.body;
  if (!title || !college_id || !capacity || hasProjector === undefined)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت کلاس ناقص است" });

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
    // check for duplicate title in the db
    const [result1, fields1] = await connection.execute(
      `select * from classes where title='${title}'`
    );

    if (result1.length !== 0)
      return res
        .status(409)
        .json({ message: "این عنوان قبلا برای کلاس دیگری وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `insert into classes (title, capacity, hasProjector, college_id) values ('${title}', ${capacity}, ${hasProjector}, ${college_id})`
    );

    res.status(201).json({ message: `کلاس مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_class = async (req, res) => {
  const { id, title, college_id, capacity, hasProjector } = req.body;
  if (!id || !title || !college_id || !capacity || hasProjector === undefined)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت کلاس ناقص است" });

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
      `select * from classes where id=${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "کلاسی مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `update classes set title = '${title}', college_id = ${college_id}, capacity = ${capacity}, hasProjector = ${hasProjector} where id = ${id}`
    );

    res.status(201).json({ message: `کلاس مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_class = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی کلاس نیاز است" });

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
      `select * from classes where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "کلاسی مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from classes where id = ${id}`
    );

    res.status(200).json({ message: `کلاس مورد نظر با موفقیت حذف شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

module.exports = {
  get_all_by_filter,
  create_class,
  update_class,
  delete_class,
};
