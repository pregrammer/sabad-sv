const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const nodemailer = require("nodemailer");

const get_all = async (req, res) => {
  const { hasTestDates } = req.body;
  if (hasTestDates === undefined)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای دریافت نیمسال ها ناقص است" });

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
      "select count(*) as count from semesters"
    );
    results.totallItems = result1[0].count;

    let query = "";
    if (hasTestDates) {
      query = `select semesters.id, semesters.educationYear, semesters.yearPart, semesters.semesterDate, semesters.unitDate, semesters.editUnitDate, semesters.test_date_id, first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelfth, thirteenth, fourteenth from semesters join test_dates on semesters.test_date_id=test_dates.id order by semesters.id desc limit ${limit} OFFSET ${startIndex}`;
    } else {
      query = `select * from semesters order by id desc limit ${limit} OFFSET ${startIndex}`;
    }
    const [result2, fields2] = await connection.execute(query);
    results.result = result2;
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }

  res.status(200).json(results);
};

const create_semester = async (req, res) => {
  const {
    educationYear,
    yearPart,
    semesterDate,
    unitDate,
    editUnitDate,
    first,
    second,
    third,
    fourth,
    fifth,
    sixth,
    seventh,
    eighth,
    ninth,
    tenth,
    eleventh,
    twelfth,
    thirteenth,
    fourteenth,
    message_title,
    message_body,
  } = req.body;
  if (
    !educationYear ||
    !yearPart ||
    !semesterDate ||
    !unitDate ||
    !editUnitDate ||
    !first ||
    !second ||
    !third ||
    !fourth ||
    !fifth ||
    !sixth ||
    !seventh ||
    !eighth ||
    !ninth ||
    !tenth ||
    !eleventh ||
    !twelfth ||
    !thirteenth ||
    !fourteenth ||
    !message_title ||
    !message_body
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت نیمسال ناقص است" });

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
    // check for duplicate educationYear and yearPart in the db
    const [result1, fields1] = await connection.execute(
      `select * from semesters where educationYear='${educationYear}' and yearPart='${yearPart}'`
    );

    if (result1.length !== 0)
      return res.status(409).json({ message: "این نیمسال قبلا ثبت شده است" });

    const query1 = `insert into test_dates (first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelfth, thirteenth, fourteenth) values ('${first}', '${second}', '${third}', '${fourth}', '${fifth}', '${sixth}', '${seventh}', '${eighth}', '${ninth}', '${tenth}', '${eleventh}', '${twelfth}', '${thirteenth}', '${fourteenth}')`;
    const [result2, fields2] = await connection.execute(query1);
    const test_date_id = result2.insertId;
    const query2 = `insert into semesters (educationYear, yearPart, semesterDate, unitDate, editUnitDate, test_date_id) values (${educationYear}, ${yearPart}, '${semesterDate}', '${unitDate}', '${editUnitDate}', ${test_date_id})`;
    const [result3, fields3] = await connection.execute(query2);

    const [result4, fields4] = await connection.execute(
      "select id, email from users where role=2"
    );
    let emails = "";
    result4.forEach(async (el) => {
      emails += el.email;
      const [result5, fields5] = await connection.execute(
        `insert into messages (title, body, to_user_id, from_user_id, created_at) 
        values ('${message_title}', '${message_body}', '${el.id}', '${
          req.user.id
        }', '${Date()}')`
      );
    });

    // email to users
    //const transporter = nodemailer.createTransport({
    //  host: "mail.travercymedia.com",
    //  port: 587,
    //  secure: false,
    //  auth: {
    //    user: "test@travercymedia.com",
    //    pass: "123abc",
    //  },
    //  /* tls: { // this is for localhost
    //      rejectUnauthorized: false,
    //    }, */
    //});

    //const mailOptions = {
    //  from: "test@travercymedia.com",
    //  to: emails,
    //  subject: message_title,
    //  text: message_body,
    //};

    //let info = await transporter.sendMail(mailOptions);

    res.status(201).json({ message: `نیمسال مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_semester = async (req, res) => {
  const {
    id,
    test_date_id,
    educationYear,
    yearPart,
    semesterDate,
    unitDate,
    editUnitDate,
    first,
    second,
    third,
    fourth,
    fifth,
    sixth,
    seventh,
    eighth,
    ninth,
    tenth,
    eleventh,
    twelfth,
    thirteenth,
    fourteenth,
  } = req.body;
  if (
    !id ||
    !test_date_id ||
    !educationYear ||
    !yearPart ||
    !semesterDate ||
    !unitDate ||
    !editUnitDate ||
    !first ||
    !second ||
    !third ||
    !fourth ||
    !fifth ||
    !sixth ||
    !seventh ||
    !eighth ||
    !ninth ||
    !tenth ||
    !eleventh ||
    !twelfth ||
    !thirteenth ||
    !fourteenth
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ویرایش نیمسال ناقص است" });

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
    // check for existing semesters.id and test_date_id in the db
    const [result1, fields1] = await connection.execute(
      `select * from semesters where id=${id} and test_date_id=${test_date_id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "نیمسالی مطابق با آیدی های ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `update semesters set educationYear = ${educationYear}, yearPart = ${yearPart}, semesterDate = '${semesterDate}', unitDate = '${unitDate}', editUnitDate = '${editUnitDate}' where id = ${id}`
    );
    const [result3, fields3] = await connection.execute(
      `update test_dates set first = '${first}', second = '${second}', third = '${third}', fourth = '${fourth}', fifth = '${fifth}', sixth = '${sixth}', seventh = '${seventh}', eighth = '${eighth}', ninth = '${ninth}', tenth = '${tenth}', eleventh = '${eleventh}', twelfth = '${twelfth}', thirteenth = '${thirteenth}', fourteenth = '${fourteenth}' where id = ${test_date_id}`
    );

    res.status(201).json({ message: `نیمسال مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_semester = async (req, res) => {
  const { id, test_date_id } = req.body;

  if (!id || !test_date_id)
    return res.status(400).json({ message: "آیدی های نیمسال نیاز است" });

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
    // check for existing semestes.id and test_date_id in the db
    const [result1, fields1] = await connection.execute(
      `select * from semesters where id = ${id} and test_date_id = ${test_date_id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "نیمسالی مطابق با آیدی های ارسالی وجود ندارد" });

    await connection.beginTransaction();

    const [result2, fields2] = await connection.execute(
      `delete from semesters where id = ${id}`
    );
    const [result3, fields3] = await connection.execute(
      `delete from test_dates where id = ${test_date_id}`
    );

    await connection.commit();

    res.status(200).json({ message: `نیمسال مورد نظر با موفقیت حذف شد` });
  } catch (error) {
    connection.rollback();
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

module.exports = {
  get_all,
  create_semester,
  update_semester,
  delete_semester,
};
