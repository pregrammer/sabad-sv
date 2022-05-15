const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const Zaravand = require("zaravand-jallali-date");
const nodemailer = require("nodemailer");

const get_all = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const hasTestDates = req.query.hasTestDates;
  if (!hasTestDates || !page || !limit)
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

  const startIndex = (page - 1) * limit;

  const results = {};

  try {
    const [result1, fields1] = await connection.execute(
      "select count(*) as count from semesters"
    );
    results.totallItems = result1[0].count;

    let query = "";
    if (hasTestDates === "true") {
      query = `select semesters.id, semesters.educationYear, semesters.yearPart, semesters.semesterDate, 
      semesters.unitDate, semesters.editUnitDate, semesters.test_date_id, first, second, third, fourth, fifth, 
      sixth, seventh, eighth, ninth, tenth, eleventh, twelfth, thirteenth, fourteenth 
      from semesters join test_dates on semesters.test_date_id=test_dates.id order by semesters.id desc 
      limit ${limit} OFFSET ${startIndex}`;
    } else {
      query = `select * from semesters order by id desc limit ${limit} OFFSET ${startIndex}`;
    }
    const [result2, fields2] = await connection.execute(query);
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

const get_last_testDates = async (req, res) => {
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
    const [result1, fields1] = await connection.execute(
      `SELECT * FROM test_dates ORDER BY ID DESC LIMIT 1`
    );
    res.status(200).json(result1[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
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
    title,
    body,
  } = req.body.data;
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
    !title ||
    !body
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
      `select count(*) as count from semesters where educationYear='${educationYear}' and yearPart='${yearPart}'`
    );

    if (result1[0].count !== 0)
      return res.status(409).json({ message: "این نیمسال قبلا ثبت شده است" });

    await connection.beginTransaction();

    const query1 = `insert into test_dates (first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, 
      tenth, eleventh, twelfth, thirteenth, fourteenth) values ('${first}', '${second}', '${third}', '${fourth}', 
      '${fifth}', '${sixth}', '${seventh}', '${eighth}', '${ninth}', '${tenth}', '${eleventh}', '${twelfth}', 
      '${thirteenth}', '${fourteenth}')`;

    const [result2, fields2] = await connection.execute(query1);
    const test_date_id = result2.insertId;

    const query2 = `insert into semesters (educationYear, yearPart, semesterDate, unitDate, editUnitDate, test_date_id) 
    values (${educationYear}, ${yearPart}, '${semesterDate}', '${unitDate}', '${editUnitDate}', ${test_date_id})`;
    const [result3, fields3] = await connection.execute(query2);

    const [result4, fields4] = await connection.execute(
      "select id, email from users where role=2"
    );

    if (result4.length) {
      const _date = new Zaravand();
      let emails = [];

      result4.forEach(async (el) => {
        emails.push(el.email);
        const [result5, fields5] = await connection.execute(
          `insert into messages (title, body, to_user_id, from_user_id, created_at) 
          values ('${title}', '${body}', '${el.id}', '${
            req.user.id
          }', '${_date.convert(Date(), "fa", "YYYY/MM/DDTHH:MM:SS.S")}')`
        );
      });

      // email to ggms
      const transporter = nodemailer.createTransport({
        host: "mail.morteza-dev.ir",
        port: 587,
        secure: false,
        auth: {
          user: "sabad@morteza-dev.ir",
          pass: "Zxasqw123456",
        },
        tls: {
          // this is for localhost
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"${req.user.firstName} ${req.user.lastName}" <sabad@morteza-dev.ir>`,
        to: emails.toString(),
        subject: title,
        text:
          body +
          "\n\n(این پیام از طریق سامانه ی سبد ارسال شده است. لطفا آنرا ریپلای نکنید)",
      };

      let info = await transporter.sendMail(mailOptions);
    }

    await connection.commit();
    res.status(201).json({ message: `نیمسال مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    connection.rollback();
    return res
      .status(500)
      .json({ message: "خطا! لطفا دقایقی دیگر دوباره امتحان کنید" });
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
  } = req.body.data;
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
    const [result0, fields0] = await connection.execute(
      `select count(*) as count from semesters where id=${id} and test_date_id=${test_date_id}`
    );

    if (result0[0].count === 0)
      return res
        .status(400)
        .json({ message: "نیمسالی مطابق با آیدی های ارسالی وجود ندارد" });

    // check for duplicate educationYear and yearPart in the db
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from semesters where educationYear='${educationYear}' and yearPart='${yearPart}' and id <> ${id}`
    );

    if (result1[0].count !== 0)
      return res.status(409).json({ message: "این نیمسال قبلا ثبت شده است" });

    await connection.beginTransaction();

    const [result2, fields2] = await connection.execute(
      `update semesters set educationYear = ${educationYear}, yearPart = ${yearPart}, semesterDate = '${semesterDate}', 
      unitDate = '${unitDate}', editUnitDate = '${editUnitDate}' where id = ${id}`
    );
    const [result3, fields3] = await connection.execute(
      `update test_dates set first = '${first}', second = '${second}', third = '${third}', fourth = '${fourth}', 
      fifth = '${fifth}', sixth = '${sixth}', seventh = '${seventh}', eighth = '${eighth}', ninth = '${ninth}', 
      tenth = '${tenth}', eleventh = '${eleventh}', twelfth = '${twelfth}', thirteenth = '${thirteenth}', 
      fourteenth = '${fourteenth}' where id = ${test_date_id}`
    );

    await connection.commit();

    res.status(201).json({ message: `نیمسال مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    connection.rollback();
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_semester = async (req, res) => {
  const { test_date_id } = req.body;

  if (!test_date_id)
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
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from semesters where test_date_id = ${test_date_id}`
    );

    if (result1[0].count === 0)
      return res
        .status(400)
        .json({ message: "نیمسالی مطابق با آیدی ارسالی وجود ندارد" });

    //await connection.beginTransaction();

    const [result2, fields2] = await connection.execute(
      `delete from test_dates where id = ${test_date_id}`
    );

    //await connection.commit();

    res.status(200).json({ message: `نیمسال مورد نظر با موفقیت حذف شد` });
  } catch (error) {
    //connection.rollback();
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

module.exports = {
  get_all,
  get_last_testDates,
  create_semester,
  update_semester,
  delete_semester,
};
