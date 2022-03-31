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
    const query = `insert into field_of_studies (name) values ('${i}مهندسی کامپیوتر')`;

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
    const query = `insert into users (email, password, firstName, lastName, role, field_of_study_id) values ('ali@yahoo.com${i}', '${hashedPwd}', 'ali${i}', 'hosseini${i}', ${Math.floor(Math.random() * 4) + 1}, ${i})`;

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
    const query = `insert into colleges (name) values ('${i}کامپیوتر')`;

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
    const query = `insert into professors (firstName, lastName, lastGrade, isInvited, email, phoneNumber, field_of_study_id) values ('saeed${i}', 'naseri${i}', ${lastGrade}, ${isInvited === 0 ? false:true}, 'saeed@yahoo.com${i}', '091245879${last_two_phoneNumber}', ${i})`;

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


/////////////////////////////////////////////// courses


/////////////////////////////////////////////// semesters


/////////////////////////////////////////////// schedules


*/