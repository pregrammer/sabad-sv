const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const bcrypt = require("bcrypt");

// create json web token
const maxAge = 60 * 60; // one hour
const createToken = (user_payload) => {
  return jwt.sign(user_payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body; //, rememberme

  if (!email || !password) { // || rememberme === undefined
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی جهت ورود به سامانه ناقص است" });
  }

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
      `select * from users where email='${email}'`
    );
    if (result1.length !== 0) {
      const isSame = await bcrypt.compare(password, result1[0].password);
      if (isSame) {
        const user_payload = {
          id: result1[0].id,
          email: result1[0].email,
          firstName: result1[0].firstName,
          lastName: result1[0].lastName,
          role: result1[0].role,
          field_of_study_id: result1[0].field_of_study_id,
        };
        const token = createToken(user_payload);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        /* if (rememberme) {
          res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        } else {
          res.cookie("jwt", token, { httpOnly: true });
        } */
        res.status(200).json({ user: user_payload });
      } else {
        return res.status(401).json({ message: "ورود نامعتبر" });
      }
    } else {
      return res.status(401).json({ message: "ورود نامعتبر" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  }

  connection.end();
};

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  return res.sendStatus(200);
};

module.exports = {
  login,
  logout,
};
