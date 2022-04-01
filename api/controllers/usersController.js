const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const bcrypt = require("bcrypt");

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
      "select count(*) as count from users"
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select users.id, email, firstName, lastName, role, field_of_study_id, name as field_of_study_name from users join field_of_studies on users.field_of_study_id=field_of_studies.id order by users.id desc limit ${limit} OFFSET ${startIndex}`
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

const create_user = async (req, res) => {
  const { email, password, firstName, lastName, role, field_of_study_id } =
    req.body;
  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !role ||
    !field_of_study_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت کاربر ناقص است" });

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
    // check for duplicate email in the db
    const [result1, fields1] = await connection.execute(
      `select * from users where email='${email}'`
    );

    if (result1.length !== 0)
      return res
        .status(409)
        .json({ message: "این ایمیل قبلا برای کاربر دیگری وارد شده است" });

    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    const [result2, fields2] = await connection.execute(
      `insert into users (email, password, firstName, lastName, role, field_of_study_id) values ('${email}', '${hashedPwd}', '${firstName}', '${lastName}', ${role}, ${field_of_study_id})`
    );

    res.status(201).json({ message: `کاربر مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_user = async (req, res) => {
  const { id, email, password, firstName, lastName, role, field_of_study_id } =
    req.body;
  if (
    !id ||
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !role ||
    !field_of_study_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ویرایش کاربر ناقص است" });

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
      `select * from users where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "کاربری مطابق با آیدی ارسالی وجود ندارد" });

    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, 10);

    const [result2, fields2] = await connection.execute(
      `update users set email = '${email}', password = '${hashedPwd}', firstName = '${firstName}', lastName = '${lastName}', role = ${role}, field_of_study_id = ${field_of_study_id} where id = ${id}`
    );

    res.status(201).json({ message: `کاربر مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_user = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی کاربر نیاز است" });

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
      `select * from users where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "کاربری مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from users where id = ${id}`
    );

    res.status(200).json({ message: `کاربر مورد نظر با موفقیت حذف شد` });
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
  create_user,
  update_user,
  delete_user,
};
