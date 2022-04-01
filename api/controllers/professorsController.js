const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

/* const get_all = async (req, res) => {
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
      "select count(*) as count from professors"
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select * from professors join field_of_studies on professors.field_of_study_id=field_of_studies.id limit ${limit} OFFSET ${startIndex}`
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
}; */

const get_all_by_filter = async (req, res) => {
  const { field_of_study_id, isInvited, lastGrade } = req.body;
  if (!field_of_study_id || isInvited === undefined || !lastGrade)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای فیلتر کردن استاد ها ناقص است" });

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

  if (field_of_study_id !== "all") {
    where_clause += `field_of_study_id=${field_of_study_id}`;
  }
  if (isInvited !== "all") {
    if (where_clause.length > 7) {
      where_clause += ` and isInvited=${isInvited}`;
    } else {
      where_clause += `isInvited=${isInvited}`;
    }
  }
  if (lastGrade !== "all") {
    if (where_clause.length > 7) {
      where_clause += ` and lastGrade=${lastGrade}`;
    } else {
      where_clause += `lastGrade=${lastGrade}`;
    }
  }

  if (where_clause.length === 7) {
    where_clause = "";
  }

  try {
    const [result1, fields1] = await connection.execute(
      "select count(*) as count from professors" + where_clause
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select professors.id, firstName, lastName, lastGrade, isInvited, email, phoneNumber, field_of_study_id, name as field_of_study_name from professors join field_of_studies on professors.field_of_study_id=field_of_studies.id${where_clause} order by professors.id desc limit ${limit} OFFSET ${startIndex}`
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

const create_professor = async (req, res) => {
  const {
    firstName,
    lastName,
    lastGrade,
    isInvited,
    email,
    phoneNumber,
    field_of_study_id,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !lastGrade ||
    isInvited === undefined ||
    !email ||
    !phoneNumber ||
    !field_of_study_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت استاد ناقص است" });

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
      `select * from professors where email='${email}'`
    );

    if (result1.length !== 0)
      return res
        .status(409)
        .json({ message: "این ایمیل قبلا برای استاد دیگری وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `insert into professors (firstName, lastName, lastGrade, isInvited, email, phoneNumber, field_of_study_id) values ('${firstName}', '${lastName}', ${lastGrade}, ${isInvited}, '${email}', '${phoneNumber}', ${field_of_study_id})`
    );

    res.status(201).json({ message: `استاد مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_professor = async (req, res) => {
  const {
    id,
    firstName,
    lastName,
    lastGrade,
    isInvited,
    email,
    phoneNumber,
    field_of_study_id,
  } = req.body;
  if (
    !id ||
    !firstName ||
    !lastName ||
    !lastGrade ||
    isInvited === undefined ||
    !email ||
    !phoneNumber ||
    !field_of_study_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت استاد ناقص است" });

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
      `select * from professors where id=${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "استادی مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `update professors set firstName = '${firstName}', lastName = '${lastName}', lastGrade = ${lastGrade}, isInvited = ${isInvited}, email = '${email}', phoneNumber = '${phoneNumber}', field_of_study_id = ${field_of_study_id} where id = ${id}`
    );

    res.status(201).json({ message: `استاد مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_professor = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی استاد نیاز است" });

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
      `select * from professors where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "استادی مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from professors where id = ${id}`
    );

    res.status(200).json({ message: `استاد مورد نظر با موفقیت حذف شد` });
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
  create_professor,
  update_professor,
  delete_professor,
};
