/*
/////////////////////////////////////////////// field_of_studies
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const name = i + "مهندسی کامپیوتر";
    const query = `insert into field_of_studies (name) values ('${name}')`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `رشته ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// users
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
const bcrypt = require("bcrypt");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const pwd = 'aa11' + i;
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const last_two_phoneNumber = Math.floor(Math.random() * (100 - 10)) + 10;
    const query = `insert into users (email, password, firstName, lastName, phoneNumber, role, field_of_study_id) values ('ali@yahoo.com${i}', '${hashedPwd}', 'ali${i}', 'hosseini${i}', '091545879${last_two_phoneNumber}', ${Math.floor(Math.random() * 4) + 1}, ${Math.floor(Math.random() * (58)) + 1})`;

    try {
      const [result2, fields2] = await connection.execute(query);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `کاربران با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// messages
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const title = 'برنامه ریزی درسی' + i;
    const body = 'برنامه را شروع کنید' + i;
    const query = `insert into messages (title, body, to_user_id, from_user_id, created_at) values ('${title}', '${body}', '${Math.floor(Math.random() * 58) + 1}', '${Math.floor(Math.random() * 58) + 1}', '${Date()}')`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `پیام ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// colleges
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const name = i + "کامپیوتر";
    const query = `insert into colleges (name) values ('${name}')`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `دانشکده ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// times
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const start = Math.floor(Math.random() * (19 - 8)) + 8;
    const end = start + 2;
    const query = `insert into times (start, end) values (${start}, ${end})`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `زمان ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// professors
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const isInvited = Math.floor(Math.random() * 2);
    const lastGrade = Math.floor(Math.random() * 3) + 1;
    const last_two_phoneNumber = Math.floor(Math.random() * (100 - 10)) + 10;
    const query = `insert into professors (firstName, lastName, lastGrade, isInvited, email, phoneNumber, field_of_study_id) values ('saeed${i}', 'naseri${i}', ${lastGrade}, ${isInvited === 0 ? false:true}, 'saeed@yahoo.com${i}', '091245879${last_two_phoneNumber}', ${Math.floor(Math.random() * (58)) + 1})`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `استاد ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// classes
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const title = `${i}کلاس آزمایشگاهی شماره ی`;
    const capacity = Math.floor(Math.random() * (81 - 10)) + 10;
    const hasProjector = Math.floor(Math.random() * 2);
    const college_id = Math.floor(Math.random() * 56) + 1;
    const query = `insert into classes (title, capacity, hasProjector, college_id) values ('${title}', ${capacity}, ${hasProjector === 1 ? true:false}, ${college_id})`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `کلاس ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// courses
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const name = i + "مبانی بازیابی اطلاعات و جستجوی وب";
    const code = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
    const unit = Math.floor(Math.random() * 3) + 1;
    const kind = i + "کارگاهی - آزمایشگاهی";
    const grade = Math.floor(Math.random() * 3) + 1;
    const termNumber = Math.floor(Math.random() * 8) + 1;
    const prerequisite_id = Math.floor(Math.random() * 58) + 1;
    const need_id = Math.floor(Math.random() * 58) + 1;
    const field_of_study_id = Math.floor(Math.random() * 58) + 1;

    const query = `insert into courses (name, code, unit, kind, grade, termNumber, prerequisite_id, need_id, field_of_study_id) values ('${name}', '${code}', ${unit}, '${kind}', ${grade}, ${termNumber}, ${prerequisite_id}, ${need_id}, ${field_of_study_id})`;

    try {
      const [result2, fields2] = await connection.execute(query);      
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `درس ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// semesters
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const educationYear = Math.floor(Math.random() * (1402 - 1386)) + 1386;
    const yearPart = Math.floor(Math.random() * 3) + 1;
    const query1 = `insert into test_dates (first, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh, twelfth, thirteenth, fourteenth) values ('${
      "1_wednesday" + i
    }', '${"2_wednesday" + i}', '${"3_wednesday" + i}', '${
      "4_wednesday" + i
    }', '${"5_wednesday" + i}', '${"6_wednesday" + i}', '${
      "7_wednesday" + i
    }', '${"8_wednesday" + i}', '${"9_wednesday" + i}', '${
      "10_wednesday" + i
    }', '${"11_wednesday" + i}', '${"12_wednesday" + i}', '${
      "13_wednesday" + i
    }', '${"14_wednesday" + i}')`;

    try {
      const [result1, fields1] = await connection.execute(query1);
      const test_date_id = result1.insertId;

      const query2 = `insert into semesters (educationYear, yearPart, semesterDate, unitDate, editUnitDate, test_date_id) values (${educationYear}, ${yearPart}, '${
        "s_sunday" + i
      }', '${"u_sunday" + i}', '${"e_sunday" + i}', ${test_date_id})`;
      const [result2, fields2] = await connection.execute(query2);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `نیمسال ها با موفقیت ثبت شدند` });
});

/////////////////////////////////////////////// schedules
const mysql = require("mysql2/promise");
const dbConfig = require("./api/config/dbConfig");
app.get("/", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  for (let i = 1; i < 59; i++) {
    const testDay = Math.floor(Math.random() * 15) + 1;
    const testDayPart = Math.floor(Math.random() * 3) + 1;
    const maxCapacity = Math.floor(Math.random() * 60) + 30;
    const minCapacity = Math.floor(Math.random() * 30) + 10;
    const courseGroup = Math.floor(Math.random() * 3) + 1;
    const weekKindClass1 = Math.floor(Math.random() * 3) + 1;
    const weekKindClass2 = Math.floor(Math.random() * 3) + 1;
    const isCertain = Math.floor(Math.random() * 2) === 1 ? true : false;
    const field_of_study_id = Math.floor(Math.random() * 58) + 1;
    const semester_id = Math.floor(Math.random() * 58) + 1;
    const course_id = Math.floor(Math.random() * 58) + 1;
    const professor_id = Math.floor(Math.random() * 58) + 1;
    const host_field_of_study_id = Math.floor(Math.random() * 58) + 1;
    const class1_id = Math.floor(Math.random() * 58) + 1;
    const class2_id = Math.floor(Math.random() * 58) + 1;
    const submitter_user_id = Math.floor(Math.random() * 58) + 1;
    const accessibleFor_user_id = Math.floor(Math.random() * 58) + 1;
    const time1_id = Math.floor(Math.random() * 58) + 1;
    const time2_id = Math.floor(Math.random() * 58) + 1;
    const weekDay1 = Math.floor(Math.random() * 6) + 1;
    const weekDay2 = Math.floor(Math.random() * 6) + 1;

    const query = `insert into schedules (testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, weekKindClass2, weekDay1, weekDay2, isCertain, field_of_study_id, semester_id, course_id, professor_id, host_field_of_study_id, class1_id, class2_id, submitter_user_id, accessibleFor_user_id, time1_id, time2_id) values (${testDay}, ${testDayPart}, ${maxCapacity}, ${minCapacity}, ${courseGroup}, ${weekKindClass1}, ${weekKindClass2}, ${weekDay1}, ${weekDay2}, ${isCertain}, ${field_of_study_id}, ${semester_id}, ${course_id}, ${professor_id}, ${host_field_of_study_id}, ${class1_id}, ${class2_id}, ${submitter_user_id}, ${accessibleFor_user_id}, ${time1_id}, ${time2_id})`;

    try {
      const [result2, fields2] = await connection.execute(query);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "خطا در اجرای دستور در پایگاه داده" });
    }
  }

  connection.end();
  res.status(201).send({ message: `درس ها با موفقیت در برنامه ثبت شدند` });
});

*/




/* integer semantic values stored in database

user:
  role = 1 (admin) || 2 (specialized group manager) || 3 (general group manager) || 4 (expert).

course:
  unit = 1 || 2 || 3.
  grade = 1 (karshenasi) || 2 (arshad) || 3 (phd).

professors:
  lastGrade = 1 (karshenasi) || 2 (arshad) || 3 (phd).

schedules:
  testDay = 1 ... 15.
  testDayPart = 1 || 2 || 3.
  weekKindClass = 1 (sabet) || 2 (zoj) || 3 (fard).
  weekDay = 1 ... 6.

semester:
  yearPart = 1 (aval) || 2 (dovom) || 3 (tabestan)

*/


