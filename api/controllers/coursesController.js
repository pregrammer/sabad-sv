const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_all_by_filter = async (req, res) => {
  const fff = req.query.field_of_study_id;
  const kind = req.query.kind;
  const termNumber = req.query.termNumber;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const forSelect = req.query.forSelect;

  if ((!fff || !kind || !termNumber || !page || !limit) && !forSelect)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای فیلتر کردن درس ها ناقص است" });

  // when user refresh the page, AuthContext removed and auth.fos_id equal to undefined.
  const field_of_study_id =
    fff !== "undefined" ? fff : req.user.field_of_study_id;

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

  let where_clause = " where ";

  if (field_of_study_id !== "all") {
    where_clause += `courses.field_of_study_id=${field_of_study_id}`;
  }
  if (termNumber !== "all") {
    let clause = "";
    switch (termNumber) {
      case "odd":
        clause =
          "(courses.termNumber = 1 or courses.termNumber = 3 or courses.termNumber = 5 or courses.termNumber = 7)";
        break;
      case "even":
        clause =
          "(courses.termNumber = 2 or courses.termNumber = 4 or courses.termNumber = 6 or courses.termNumber = 8)";
        break;
      default:
        clause = `courses.termNumber = ${termNumber}`;
        break;
    }
    if (where_clause.length > 7) {
      where_clause += ` and ${clause}`;
    } else {
      where_clause += `${clause}`;
    }
  }
  if (kind !== "all") {
    if (where_clause.length > 7) {
      where_clause += ` and courses.kind='${kind}'`;
    } else {
      where_clause += `courses.kind='${kind}'`;
    }
  }

  if (where_clause.length === 7) {
    where_clause = "";
  }

  try {
    if (forSelect === "true") {
      const [result1, fields1] = await connection.execute(
        `select id, name from courses where field_of_study_id = ${req.user.field_of_study_id}`
      );
      return res.status(200).json(result1);
    }

    const [result1, fields1] = await connection.execute(
      "select count(*) as count from courses" + where_clause
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select courses.id, courses.name, courses.code, courses.unit, courses.kind, courses.grade, courses.termNumber, 
      courses.prerequisite_id, pre.name as pre_name, courses.need_id, need.name as need_name 
      from courses left join courses pre on courses.prerequisite_id=pre.id left join courses need on courses.need_id=need.id${where_clause} 
      order by courses.id desc limit ${limit} OFFSET ${startIndex}`
    );
    results.result = result2;
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const create_course = async (req, res) => {
  const {
    name,
    code,
    unit,
    kind,
    grade,
    termNumber,
    prerequisite_id,
    need_id,
  } = req.body.data;
  if (
    !name ||
    !code ||
    !unit ||
    !kind ||
    !grade ||
    !termNumber ||
    !prerequisite_id ||
    !need_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت درس ناقص است" });

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
    // check for duplicate code in the db
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from courses where code='${code}'`
    );

    if (result1[0].count !== 0)
      return res
        .status(409)
        .json({ message: "این کد درس قبلا برای درس دیگری وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `insert into courses (name, code, unit, kind, grade, termNumber, prerequisite_id, need_id, field_of_study_id) 
      values ('${name}', '${code}', ${unit}, '${kind}', ${grade}, ${termNumber}, 
      ${prerequisite_id}, ${need_id}, ${req.user.field_of_study_id})`
    );

    res.status(201).json({ message: `درس مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_course = async (req, res) => {
  const {
    id,
    name,
    code,
    unit,
    kind,
    grade,
    termNumber,
    prerequisite_id,
    need_id,
  } = req.body.data;
  if (
    !id ||
    !name ||
    !code ||
    !unit ||
    !kind ||
    !grade ||
    !termNumber ||
    prerequisite_id === undefined ||
    need_id === undefined
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ویرایش درس ناقص است" });

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
      `select count(*) as count from courses where id=${id}`
    );

    if (result0[0].count === 0)
      return res
        .status(400)
        .json({ message: "درسی مطابق با آیدی ارسالی وجود ندارد" });

    // check for duplicate code in the db
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from courses where code='${code}' and id <> ${id}`
    );

    if (result1[0].count !== 0)
      return res
        .status(409)
        .json({ message: "این کد درس قبلا برای درس دیگری وارد شده است" });

    const [result2, fields2] = await connection.execute(
      `update courses set name = '${name}', code = '${code}', unit = ${unit}, grade = ${grade}, kind = '${kind}', 
      termNumber = ${termNumber}, prerequisite_id = ${prerequisite_id}, need_id = ${need_id} where id = ${id}`
    );

    res.status(201).json({ message: `درس مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_course = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی درس نیاز است" });

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
      `select count(*) as count from courses where id = ${id}`
    );

    if (result1[0].count === 0)
      return res
        .status(400)
        .json({ message: "درسی مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from courses where id = ${id} or prerequisite_id = ${id} or need_id = ${id}`
    );

    res.status(200).json({ message: `درس مورد نظر با موفقیت حذف شد` });
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
  create_course,
  update_course,
  delete_course,
};
