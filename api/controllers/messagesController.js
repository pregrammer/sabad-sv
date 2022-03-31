const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_others_messages = async (req, res) => {
  const id = req.user.id;
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
      `select count(*) as count from messages where to_user_id=${id} and from_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select messages.id, messages.title, messages.body, messages.isSeen, messages.created_at, users.firstName, users.lastName, field_of_studies.name as field_of_study from messages join users on messages.from_user_id=users.id join field_of_studies on users.field_of_study_id=field_of_studies.id where to_user_id=${id} and from_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id}) limit ${limit} OFFSET ${startIndex}`
    );
    results.result = result2;

    const [result3, fields3] = await connection.execute(
      `update messages set isSeen=true where to_user_id=${id} and from_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  connection.end();

  res.status(200).json(results);
};

const get_my_saved_messages = async (req, res) => {
  const id = req.user.id;
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
      `select count(*) as count from messages where to_user_id=${id} and from_user_id=${id}`
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select id, title, body, created_at from messages where to_user_id=${id} and from_user_id=${id} limit ${limit} OFFSET ${startIndex}`
    );
    results.result = result2;
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  connection.end();

  res.status(200).json(results);
};

const get_my_sent_messages = async (req, res) => {
  const id = req.user.id;
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
      `select count(*) as count from messages where from_user_id=${id} and to_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select id, title, body, isSeen, created_at from messages where from_user_id=${id} and to_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id}) limit ${limit} OFFSET ${startIndex}`
    );
    results.result = result2;
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  connection.end();

  res.status(200).json(results);
};

const get_unseen_messages_count = async (req, res) => {
  const id = req.user.id;
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
      `select count(*) as count from messages where to_user_id=${id} and from_user_id<>${id} and isSeen=false and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
    );
    res.status(200).json(result1[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  connection.end();
};

const create_message = async (req, res) => {
  const { title, body, to_user_id } = req.body;
  if (!title || !body || !to_user_id)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت پیام ناقص است" });

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
      `insert into messages (title, body, to_user_id, from_user_id, created_at) values ('${title}', '${body}', '${to_user_id}', '${
        req.user.id
      }', '${Date()}')`
    );

    res.status(201).json({ message: `پیام مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }
  connection.end();
};

const update_message = async (req, res) => {
  const { id, title, body, to_user_id } = req.body;
  if (!id || !title || !body || !to_user_id)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت پیام ناقص است" });

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
      `select * from messages where id='${id}'`
    );
    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "پیامی مطابق با آیدی ارسالی وجود ندارد" });

    // check message to be unseen
    const [result2, fields2] = await connection.execute(
      `select * from messages where id='${id}' and isSeen=true`
    );
    if (result2.length !== 0)
      return res.status(403).json({
        message: "این پیام توسط کاربر دیده شده و امکان تغییر در آن وجود ندارد",
      });

    const [result3, fields3] = await connection.execute(
      `update messages set title='${title}', body='${body}', to_user_id='${to_user_id}' where id='${id}'`
    );

    res.status(201).json({ message: `پیام مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }
  connection.end();
};

const delete_message = async (req, res) => {
  // if to, from, user.id are the same or deletedFor_user_id is not null, delete it. if not fill the user.id in the deletedFor_user_id.
  const { id, forBoth } = req.body;

  if (!id || forBoth === undefined)
    return res.status(400).json({ message: "اطلاعات برای حذف پیام ناقص است" });

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
      `select * from messages where id='${id}'`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "پیامی مطابق با آیدی ارسالی وجود ندارد" });

    if (forBoth) {
      // check message to be unseen
      const [result2, fields2] = await connection.execute(
        `select * from messages where id='${id}' and isSeen=true`
      );
      if (result2.length !== 0)
        return res.status(403).json({
          message:
            "این پیام توسط کاربر دیده شده و امکان تغییر در آن وجود ندارد",
        });
      const [result4, fields4] = await connection.execute(
        `delete from messages where id = '${id}'`
      );
    } else {
      const [result3, fields3] = await connection.execute(
        `select to_user_id, from_user_id, deletedFor_user_id from messages where id='${id}'`
      );

      if (
        (result3[0].to_user_id === result3[0].from_user_id &&
          result3[0].from_user_id === req.user.id) ||
        result3[0].deletedFor_user_id !== null
      ) {
        const [result4, fields4] = await connection.execute(
          `delete from messages where id = '${id}'`
        );
      } else {
        const [result4, fields4] = await connection.execute(
          `update messages set deletedFor_user_id = '${req.user.id}' where id = '${id}'`
        );
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }
  res.status(200).json({ message: `پیام مورد نظر با موفقیت حذف شد` });
  connection.end();
};

module.exports = {
  get_others_messages,
  get_my_saved_messages,
  get_my_sent_messages,
  get_unseen_messages_count,
  create_message,
  update_message,
  delete_message,
};
