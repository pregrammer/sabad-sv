const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_weekly_schedules_by_filter = async (req, res) => {
  // just retrieve fields needed based on figma
  
};

const get_test_schedules_by_filter = async (req, res) => {
  // just retrieve fields needed based on figma
};

const get_schedule = async (req, res) => {
  const id = req.body.id;

  if (!id) return res.status(400).json({ message: "آیدی برنامه نیاز است" });

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
      `select * from courses where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    const query =
      "select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, weekKindClass2, isCertain, " +
      "schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, " +
      "schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, " +
      "fos1.id as fos_id, fos1.name as fos_name, fos2.id as host_fos_id, fos2.name as host_fos_name, users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, " +
      "users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, " +
      "classes1.id as class1_id, classes1.title as class1_title, classes2.id as class2_id, classes2.title as class2_title, " +
      "times1.id as time1_id, times1.start as time1_start, times1.end as time1_end, times2.id as time2_id, times2.start as time2_start, times2.end as time2_end " +
      "from schedules join semesters on schedules.semester_id=semesters.id " +
      "join courses courses1 on schedules.course_id=courses1.id " +
      "join courses courses2 on courses1.prerequisite_id=courses2.id " +
      "join courses courses3 on courses1.need_id=courses3.id " +
      "join professors on schedules.professor_id=professors.id " +
      "join field_of_studies fos1 on schedules.field_of_study_id=fos1.id " +
      "join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id " +
      "join users users1 on schedules.submitter_user_id=users1.id " +
      "join users users2 on schedules.accessibleFor_user_id=users2.id " +
      "join classes classes1 on schedules.class1_id=classes1.id " +
      "join classes classes2 on schedules.class2_id=classes2.id " +
      "join times times1 on schedules.time1_id=times1.id " +
      "join times times2 on schedules.time2_id=times2.id " +
      `where schedules.id=${id}`;
    const [result2, fields2] = await connection.execute(query);

    res.status(200).json(result2[0]);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const get_class_freeTimes = async (req, res) => {
  const class_id = req.body.id;

  const freeTimes = {
    saturday: {},
    sunday: {},
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
  };
  return freeTimes;
};

const create_schedule = async (req, res) => {
  /*
  checks:

  semester_id and course_id and courseGroup. // این درس قبلا به برنامه اضافه شده است

  testDay and testDayPart. // روز امتحان با روز امتحان درس دیگری تداخل دارد

  (class1 and time1 and wkc1) and (class1 and time1 and wkc1). if wkc === req === 1 ? fail,
  if wkc === 2 ? req can be 3 else fail, if wkc === 3 ? req can be 2 else fail. // ساعت کلاس با ساعت کلاس دیگری تداخل دارد
  first check times ids if not same do func; if func is true fail else check wkc.

  */
  // put req.user.id in submitter_user_id
};

const email_schedule = async (req, res) => {
  const professor_id = req.body.professor_id;
};

const update_schedule = async (req, res) => {};

const update_schedule_state = async (req, res) => {
  const id = req.body.id;
};

const delete_schedule = async (req, res) => {};

module.exports = {
  get_weekly_schedules_by_filter,
  get_test_schedules_by_filter,
  get_schedule,
  get_class_freeTimes,
  create_schedule,
  email_schedule,
  update_schedule,
  update_schedule_state,
  delete_schedule,
};

function hasTimeInterference() {
  let inp_rangeArr = [];
  for (let i = i.start; i < i.end; i++) {
    inp_rangeArr.push(i);
  }

  let db_rangeArr = [];
  for (let i = d.start; i < d.end; i++) {
    db_rangeArr.push(i);
  }
  let new_db_rangeArr = [...db_rangeArr];

  inp_rangeArr.forEach((num) => {
    const index = new_db_rangeArr.indexOf(num);
    if (index > -1) {
      new_db_rangeArr.splice(index, 1);
    }
  });

  if (new_db_rangeArr.length === db_rangeArr.length) {
    return false;
  } else {
    return true;
  }
}
