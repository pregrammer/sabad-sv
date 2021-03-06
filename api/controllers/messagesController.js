const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const Zaravand = require("zaravand-jallali-date");
const nodemailer = require("nodemailer");

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
      `select count(*) as count from messages where to_user_id=${id} and from_user_id<>${id} 
      and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select messages.id, messages.title, messages.body, messages.isSeen, messages.created_at, 
      users.firstName, users.lastName, field_of_studies.name as field_of_study 
      from messages join users on messages.from_user_id=users.id join field_of_studies on users.field_of_study_id=field_of_studies.id 
      where to_user_id=${id} and from_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id}) 
      order by messages.id desc limit ${limit} OFFSET ${startIndex}`
    );
    results.result = result2;

    if (result2.length) {
      const [result3, fields3] = await connection.execute(
        `update messages set isSeen=true where to_user_id=${id} and from_user_id<>${id} 
        and (deletedFor_user_id is null or deletedFor_user_id<>${id}) and id in (${result2.map(
          (res) => res.id
        )})`
      );
    }

    res.status(200).json(results);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
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
      `select id, title, body, created_at 
      from messages where to_user_id=${id} and from_user_id=${id} 
      order by id desc limit ${limit} OFFSET ${startIndex}`
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
      `select count(*) as count from messages where from_user_id=${id} and to_user_id<>${id} 
      and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
    );
    results.totallItems = result1[0].count;

    const [result2, fields2] = await connection.execute(
      `select messages.id, messages.title, messages.body, messages.isSeen, messages.created_at, 
      users.firstName, users.lastName, field_of_studies.name as field_of_study 
      from messages join users on messages.to_user_id=users.id join field_of_studies on users.field_of_study_id=field_of_studies.id 
      where from_user_id=${id} and to_user_id<>${id} and (deletedFor_user_id is null or deletedFor_user_id<>${id}) 
      order by id desc limit ${limit} OFFSET ${startIndex}`
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
      `select count(*) as count from messages 
      where to_user_id=${id} and from_user_id<>${id} and isSeen=false and (deletedFor_user_id is null or deletedFor_user_id<>${id})`
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

const create_message = async (req, res) => {
  const { title, body, to_user_id } = req.body.data;
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
    // to_user_id === 'sgm': send msg to all specialized group managers
    // to_user_id === 'ggm': send msg to all general group managers
    // to_user_id === user_id: send msg to just user_id

    await connection.beginTransaction();

    const _date = new Zaravand();

    if (to_user_id === "sgm") {
      const [result1, fields1] = await connection.execute(
        `select id, email from users where role = 2 and id <> ${req.user.id}`
      );
      if (!result1.length) {
        return res
          .status(400)
          .json({ message: "مدیر گروه تخصصی ای وجود ندارد" });
      }

      let emails = [];
      result1.forEach(async (obj) => {
        emails.push(obj.email);
        const [result2, fields2] = await connection.execute(
          `insert into messages (title, body, to_user_id, from_user_id, created_at) values ('${title}', '${body}', ${
            obj.id
          }, '${req.user.id}', '${_date.convert(
            Date(),
            "fa",
            "YYYY/MM/DDTHH:MM:SS.S"
          )}')`
        );
      });

      // email to sgms
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
    } else if (to_user_id === "ggm") {
      const [result3, fields3] = await connection.execute(
        `select id, email from users where role = 3 and id <> ${req.user.id}`
      );
      if (!result3.length) {
        return res
          .status(400)
          .json({ message: "مدیر گروه عمومی ای وجود ندارد" });
      }

      let emails = [];
      result3.forEach(async (obj) => {
        emails.push(obj.email);
        const [result4, fields4] = await connection.execute(
          `insert into messages (title, body, to_user_id, from_user_id, created_at) values ('${title}', '${body}', ${
            obj.id
          }, '${req.user.id}', '${_date.convert(
            Date(),
            "fa",
            "YYYY/MM/DDTHH:MM:SS.S"
          )}')`
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
    } else {
      const [result5, fields5] = await connection.execute(
        `select email from users where id = ${to_user_id}`
      );

      const [result6, fields6] = await connection.execute(
        `insert into messages (title, body, to_user_id, from_user_id, created_at) values ('${title}', '${body}', ${to_user_id}, '${
          req.user.id
        }', '${_date.convert(Date(), "fa", "YYYY/MM/DDTHH:MM:SS.S")}')`
      );

      if (req.user.id !== to_user_id) {
        // email to user
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
          to: result5[0].email,
          subject: title,
          text:
            body +
            "\n\n(این پیام از طریق سامانه ی سبد ارسال شده است. لطفا آنرا ریپلای نکنید)",
        };

        let info = await transporter.sendMail(mailOptions);
      }
    }

    await connection.commit();

    res.status(201).json({ message: `پیام مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    connection.rollback();
    return res
      .status(500)
      .json({ message: "خطا! لطفا دقایقی دیگر دوباره امتحان کنید" });
  } finally {
    connection.end();
  }
};

/* const update_message = async (req, res) => {
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
      `select * from messages where id = ${id}`
    );
    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "پیامی مطابق با آیدی ارسالی وجود ندارد" });

    // check message to be unseen
    const [result2, fields2] = await connection.execute(
      `select * from messages where id = ${id} and isSeen=true`
    );
    if (result2.length !== 0)
      return res.status(403).json({
        message: "این پیام توسط کاربر دیده شده و امکان تغییر در آن وجود ندارد",
      });

    const [result3, fields3] = await connection.execute(
      `update messages set title='${title}', body='${body}', to_user_id=${to_user_id} where id=${id}`
    );

    res.status(201).json({ message: `پیام مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
}; */

const delete_message = async (req, res) => {
  // if to, from, user.id are the same or deletedFor_user_id is not null, delete it. if not fill the user.id in the deletedFor_user_id.
  const { id } = req.body;

  if (!id)
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
    const [result1, fields1] = await connection.execute(
      `select to_user_id, from_user_id, deletedFor_user_id from messages where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "پیامی مطابق با آیدی ارسالی وجود ندارد" });

    if (
      (result1[0].to_user_id === result1[0].from_user_id &&
        result1[0].from_user_id === req.user.id) ||
      result1[0].deletedFor_user_id !== null
    ) {
      const [result2, fields2] = await connection.execute(
        `delete from messages where id = ${id}`
      );
    } else {
      const [result2, fields2] = await connection.execute(
        `update messages set deletedFor_user_id = ${req.user.id} where id = ${id}`
      );
    }

    res.status(200).json({ message: `پیام مورد نظر با موفقیت حذف شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

module.exports = {
  get_others_messages,
  get_my_saved_messages,
  get_my_sent_messages,
  get_unseen_messages_count,
  create_message,
  delete_message,
};
