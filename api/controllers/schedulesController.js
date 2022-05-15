const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");
const nodemailer = require("nodemailer");

const get_all = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  if (!page || !limit)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ذریافت برنامه ها ناقص است" });

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

  const { id, role, field_of_study_id } = req.user;
  // role === 2 ? schedules.field_of_study_id = field_of_study_id
  // role === 3 ? schedules.accessibleFor_user_id = id

  try {
    const [result1, fields1] = await connection.execute(
      `SELECT id FROM semesters ORDER BY ID DESC LIMIT 1`
    );
    if (!result1.length) {
      return res.status(400).json({ message: "هنوز هیچ نیمسالی تعریف نشده" });
    }

    const [result2, fields2] = await connection.execute(
      `select count(*) as count from schedules where schedules.semester_id = ${
        result1[0].id
      } 
      and ${
        role === 2
          ? `schedules.field_of_study_id = ${field_of_study_id}`
          : `schedules.accessibleFor_user_id = ${id}`
      }`
    );
    results.totallItems = result2[0].count;

    const query = `select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, 
    weekKindClass2, weekDay1, weekDay2, isCertain, 
    semesters.yearPart, schedules.course_id, courses1.name as course_name, courses1.code as course_code, 
    courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, 
    schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, 
    fos1.id as fos_id, fos1.name as fos_name, fos2.id as host_fos_id, fos2.name as host_fos_name, 
    users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, 
    users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, 
    classes1.id as class1_id, classes1.title as class1_title, classes2.id as class2_id, classes2.title as class2_title, 
    times1.id as time1_id, times1.start as time1_start, times1.end as time1_end, 
    times2.id as time2_id, times2.start as time2_start, times2.end as time2_end 
    from schedules left join semesters on schedules.semester_id=semesters.id 
    left join courses courses1 on schedules.course_id=courses1.id 
    left join courses courses2 on courses1.prerequisite_id=courses2.id 
    left join courses courses3 on courses1.need_id=courses3.id 
    left join professors on schedules.professor_id=professors.id 
    left join field_of_studies fos1 on schedules.field_of_study_id=fos1.id 
    left join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id
    left join users users1 on schedules.submitter_user_id=users1.id 
    left join users users2 on schedules.accessibleFor_user_id=users2.id 
    left join classes classes1 on schedules.class1_id=classes1.id 
    left join classes classes2 on schedules.class2_id=classes2.id 
    left join times times1 on schedules.time1_id=times1.id 
    left join times times2 on schedules.time2_id=times2.id 
    where schedules.semester_id = ${result1[0].id} 
    and ${
      role === 2
        ? `schedules.field_of_study_id = ${field_of_study_id}`
        : `schedules.accessibleFor_user_id = ${id}`
    } order by schedules.id desc limit ${limit} OFFSET ${startIndex}`;

    const [result3, fields3] = await connection.execute(query);
    results.result = result3;

    res.status(200).json(results);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const get_weekly_schedules_by_filter = async (req, res) => {
  const fff = req.query.field_of_study_id;
  const professor_id = req.query.professor_id;
  const termNumber = req.query.termNumber;
  const class_id = req.query.class_id;
  const semester_id = req.query.semester_id;
  if (!fff || !professor_id || !termNumber || !class_id || !semester_id)
    return res.status(400).json({
      message: "اطلاعات ارسالی برای فیلتر کردن برنامه ی هفتگی ناقص است",
    });

  // when user refresh the page, AuthContext removed and auth.fos_id equal to undefined.
  const field_of_study_id =
    fff !== "undefined" ? fff : req.user.field_of_study_id;

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  let where_clause = "";

  if (field_of_study_id !== "all") {
    where_clause += ` and schedules.field_of_study_id=${field_of_study_id}`;
  }
  if (professor_id !== "all") {
    where_clause += ` and schedules.professor_id=${professor_id}`;
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
    where_clause += ` and ${clause}`;
  }

  // for spliting class1_id and class2_id
  let where_clause2 = where_clause;

  if (class_id !== "all") {
    where_clause += ` and schedules.class1_id=${class_id}`;
    where_clause2 += ` and schedules.class2_id=${class_id}`;
  }

  try {
    const [result0, fields0] = await connection.execute(
      `select count(*) as count from semesters where id = ${semester_id}`
    );
    if (result0[0].count === 0)
      return res.status(400).json({ message: "درخواست نامعتبر" });

    const [results, fields] = await connection.query(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=1 and schedules.semester_id = ${semester_id}${where_clause};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=1 and schedules.semester_id = ${semester_id}${where_clause2};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=2 and schedules.semester_id = ${semester_id}${where_clause};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=2 and schedules.semester_id = ${semester_id}${where_clause2};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=3 and schedules.semester_id = ${semester_id}${where_clause};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=3 and schedules.semester_id = ${semester_id}${where_clause2};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=4 and schedules.semester_id = ${semester_id}${where_clause};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=4 and schedules.semester_id = ${semester_id}${where_clause2};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=5 and schedules.semester_id = ${semester_id}${where_clause};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=5 and schedules.semester_id = ${semester_id}${where_clause2};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=6 and schedules.semester_id = ${semester_id}${where_clause};
      select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, courses.unit, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=6 and schedules.semester_id = ${semester_id}${where_clause2}`
    );

    /*     const saturday = [...results[0], ...results[1]];
    const sunday = [...results[2], ...results[3]];
    const monday = [...results[4], ...results[5]];
    const tuesday = [...results[6], ...results[7]];
    const wednesday = [...results[8], ...results[9]];
    const thursday = [...results[10], ...results[11]]; */

    const saturday = [...results[0], ...results[1]].sort(
      (a, b) => a.start - b.start
    );
    const sunday = [...results[2], ...results[3]].sort(
      (a, b) => a.start - b.start
    );
    const monday = [...results[4], ...results[5]].sort(
      (a, b) => a.start - b.start
    );
    const tuesday = [...results[6], ...results[7]].sort(
      (a, b) => a.start - b.start
    );
    const wednesday = [...results[8], ...results[9]].sort(
      (a, b) => a.start - b.start
    );
    const thursday = [...results[10], ...results[11]].sort(
      (a, b) => a.start - b.start
    );

    const schedule = {
      saturday,
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
    };

    res.status(200).json(schedule);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const get_test_schedules_by_filter = async (req, res) => {
  const fff = req.query.field_of_study_id;
  const professor_id = req.query.professor_id;
  const termNumber = req.query.termNumber;
  const semester_id = req.query.semester_id;
  if (!fff || !professor_id || !termNumber || !semester_id)
    return res.status(400).json({
      message: "اطلاعات ارسالی برای فیلتر کردن برنامه ی امتحانی ناقص است",
    });

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

  let where_clause = " where ";

  if (field_of_study_id !== "all") {
    where_clause += `schedules.field_of_study_id=${field_of_study_id}`;
  }
  if (professor_id !== "all") {
    if (where_clause.length > 7) {
      where_clause += ` and schedules.professor_id=${professor_id}`;
    } else {
      where_clause += `schedules.professor_id=${professor_id}`;
    }
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

  if (where_clause.length === 7) {
    where_clause += "host_field_of_study_id is null and courseGroup = 1";
  } else {
    where_clause += " and host_field_of_study_id is null and courseGroup = 1";
  }
  // host_field_of_study_id is null: maybe we have some db_schedules with same data and different host_fos;
  // we want to fetch just the main one (that has null host_fos).
  // courseGroup = 1: we just want one schedule from same schedules with different courseGroup.

  try {
    const [result0, fields0] = await connection.execute(
      `select count(*) as count from semesters where id = ${semester_id}`
    );
    if (result0[0].count === 0)
      return res.status(400).json({ message: "درخواست نامعتبر" });

    const [result1, fields1] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, 
      testDay, testDayPart 
      from schedules join courses on schedules.course_id=courses.id 
      join field_of_studies on schedules.field_of_study_id=field_of_studies.id
      ${where_clause} and schedules.semester_id = ${semester_id}`
    );

    const schedule = {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: [],
      sixth: [],
      seventh: [],
      eighth: [],
      ninth: [],
      tenth: [],
      eleventh: [],
      twelfth: [],
      thirteenth: [],
      fourteenth: [],
      out_of_range: [],
    };

    // if "host_fos is null" is not in our where_clause, we use this filter for each case.
    /*
    let has_conflict_1 = false;
    for (let i = 0; i < schedule.first.length; i++) {
      if (
        schedule.first[i].testDay === sch.testDay &&
        schedule.first[i].testDayPart === sch.testDayPart
      ) {
        has_conflict_1 = true;
        break;
      }
    }
    if (!has_conflict_1) {
      schedule.first.push(sch);
    }
    */
    result1.forEach((sch) => {
      switch (sch.testDay) {
        case 1:
          schedule.first.push(sch);
          break;
        case 2:
          schedule.second.push(sch);
          break;
        case 3:
          schedule.third.push(sch);
          break;
        case 4:
          schedule.fourth.push(sch);
          break;
        case 5:
          schedule.fifth.push(sch);
          break;
        case 6:
          schedule.sixth.push(sch);
          break;
        case 7:
          schedule.seventh.push(sch);
          break;
        case 8:
          schedule.eighth.push(sch);
          break;
        case 9:
          schedule.ninth.push(sch);
          break;
        case 10:
          schedule.tenth.push(sch);
          break;
        case 11:
          schedule.eleventh.push(sch);
          break;
        case 12:
          schedule.twelfth.push(sch);
          break;
        case 13:
          schedule.thirteenth.push(sch);
          break;
        case 14:
          schedule.fourteenth.push(sch);
          break;
        case 15:
          schedule.out_of_range.push(sch);
          break;
        default:
          break;
      }
    });

    res.status(200).json(schedule);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const get_schedule = async (req, res) => {
  const id = parseInt(req.query.id);

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
      `select testDay, semester_id from schedules where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `select * from test_dates where id = ${result1[0].semester_id}`
    );
    let test = {};
    switch (result1[0].testDay) {
      case 1:
        test.testDayName = "اول";
        test.test_dates = JSON.parse(result2[0].first);
        break;
      case 2:
        test.testDayName = "دوم";
        test.test_dates = JSON.parse(result2[0].second);
        break;
      case 3:
        test.testDayName = "سوم";
        test.test_dates = JSON.parse(result2[0].third);
        break;
      case 4:
        test.testDayName = "چهارم";
        test.test_dates = JSON.parse(result2[0].fourth);
        break;
      case 5:
        test.testDayName = "پنجم";
        test.test_dates = JSON.parse(result2[0].fifth);
        break;
      case 6:
        test.testDayName = "ششم";
        test.test_dates = JSON.parse(result2[0].sixth);
        break;
      case 7:
        test.testDayName = "هفتم";
        test.test_dates = JSON.parse(result2[0].seventh);
        break;
      case 8:
        test.testDayName = "هشتم";
        test.test_dates = JSON.parse(result2[0].eighth);
        break;
      case 9:
        test.testDayName = "نهم";
        test.test_dates = JSON.parse(result2[0].ninth);
        break;
      case 10:
        test.testDayName = "دهم";
        test.test_dates = JSON.parse(result2[0].tenth);
        break;
      case 11:
        test.testDayName = "یازدهم";
        test.test_dates = JSON.parse(result2[0].eleventh);
        break;
      case 12:
        test.testDayName = "دوازدهم";
        test.test_dates = JSON.parse(result2[0].twelfth);
        break;
      case 13:
        test.testDayName = "سیزدهم";
        test.test_dates = JSON.parse(result2[0].thirteenth);
        break;
      case 14:
        test.testDayName = "چهاردهم";
        test.test_dates = JSON.parse(result2[0].fourteenth);
        break;
      case 15:
        test.testDayName = "ندارد";
        break;
      default:
        break;
    }

    const query = `select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, 
      weekKindClass2, weekDay1, weekDay2, isCertain, schedules.semester_id, semesters.yearPart, 
      schedules.course_id, courses1.name as course_name, courses1.code as course_code, courses2.id as prerequisite_id, courses2.name as prerequisite_name, 
      courses3.id as need_id, courses3.name as need_name, schedules.professor_id, professors.firstName as professor_firstName, 
      professors.lastName as professor_lastName, fos1.id as fos_id, fos1.name as fos_name, 
      fos2.id as host_fos_id, fos2.name as host_fos_name, users1.id as submitter_id, users1.firstName as submitter_firstName, 
      users1.lastName as submitter_lastName, users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, 
      users2.lastName as accessibleFor_lastName, classes1.id as class1_id, classes1.title as class1_title, 
      classes2.id as class2_id, classes2.title as class2_title, times1.id as time1_id, times1.start as time1_start, 
      times1.end as time1_end, times2.id as time2_id, times2.start as time2_start, times2.end as time2_end 
      from schedules left join semesters on schedules.semester_id=semesters.id 
      left join courses courses1 on schedules.course_id=courses1.id 
      left join courses courses2 on courses1.prerequisite_id=courses2.id 
      left join courses courses3 on courses1.need_id=courses3.id 
      left join professors on schedules.professor_id=professors.id 
      left join field_of_studies fos1 on schedules.field_of_study_id=fos1.id 
      left join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id 
      left join users users1 on schedules.submitter_user_id=users1.id 
      left join users users2 on schedules.accessibleFor_user_id=users2.id 
      left join classes classes1 on schedules.class1_id=classes1.id 
      left join classes classes2 on schedules.class2_id=classes2.id 
      left join times times1 on schedules.time1_id=times1.id 
      left join times times2 on schedules.time2_id=times2.id 
      where schedules.id=${id}`;

    const [result3, fields3] = await connection.execute(query);

    res.status(200).json({ ...result3[0], ...test });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const create_schedule = async (req, res) => {
  const {
    testDay,
    testDayPart,
    maxCapacity,
    minCapacity,
    courseGroup,
    weekKindClass1,
    weekKindClass2,
    weekDay1,
    weekDay2,
    course_id,
    professor_id,
    host_field_of_study_id,
    class1_id,
    class2_id,
    accessibleFor_user_id,
    time1_id,
    time2_id,
  } = req.body.data;
  if (
    !testDay ||
    !testDayPart ||
    !maxCapacity ||
    !minCapacity ||
    !courseGroup ||
    !weekKindClass1 ||
    !weekKindClass2 ||
    !weekDay1 ||
    !weekDay2 ||
    !course_id ||
    !professor_id ||
    !host_field_of_study_id ||
    !class1_id ||
    !class2_id ||
    !accessibleFor_user_id ||
    !time1_id ||
    !time2_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ثبت برنامه ناقص است" });

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
    // fetch last semester_id
    const [result00, fields00] = await connection.execute(
      `SELECT id FROM semesters ORDER BY ID DESC LIMIT 1`
    );
    const semester_id = result00[0].id;

    // if we have host_fos, it means that input_schedule is the same as one of db_schedule, but with different host_fos.

    // if user wants to use host_fos, check that do we have this input_schedule in the db;
    // if we have, the db_data is the same as input_data but host_fos = null.
    if (host_field_of_study_id !== -1) {
      const [result0, fields0] = await connection.execute(
        `select count(*) as count from schedules 
      where testDay = ${testDay} and testDayPart = ${testDayPart} and maxCapacity = ${maxCapacity} 
      and minCapacity = ${minCapacity} and courseGroup = ${courseGroup} and weekKindClass1 = ${weekKindClass1} 
      and ${
        class2_id !== -1
          ? `weekKindClass2 = ${weekKindClass2}`
          : "weekKindClass2 is null"
      } and weekDay1 = ${weekDay1} 
      and ${class2_id !== -1 ? `weekDay2 = ${weekDay2}` : "weekDay2 is null"} 
      and field_of_study_id = ${host_field_of_study_id} and semester_id = ${semester_id} and course_id = ${course_id} 
      and professor_id = ${professor_id} and host_field_of_study_id is null and class1_id = ${class1_id} 
      and class2_id = ${
        class2_id !== -1 ? `class2_id = ${class2_id}` : "class2_id is null"
      } 
      and ${
        accessibleFor_user_id === -1
          ? "accessibleFor_user_id is null"
          : `accessibleFor_user_id = ${accessibleFor_user_id}`
      } and time1_id = ${time1_id} 
      and time2_id = ${
        class2_id !== -1 ? `time2_id = ${time2_id}` : "time2_id is null"
      }`
      );
      if (result0[0].count === 0)
        return res.status(400).json({
          message: "این درس هنوز تعریف نشده و نمی توان از آن میزبانی گرفت",
        });
    }

    // check for duplicate schedule in the db
    const [result1, fields1] = await connection.execute(
      `select count(*) as count from schedules 
      where semester_id=${semester_id} and ${
        host_field_of_study_id !== -1
          ? `host_field_of_study_id = ${host_field_of_study_id}`
          : "host_field_of_study_id is null"
      } 
      and course_id=${course_id} and courseGroup=${courseGroup}`
    );
    if (result1[0].count !== 0)
      return res
        .status(409)
        .json({ message: "این درس قبلا در برنامه اضافه شده است" });

    // check for interferece test date in the db
    /* const [result2, fields2] = await connection.execute(
      `select * from schedules 
      where semester_id=${semester_id} and ${
        host_field_of_study_id !== -1
          ? `host_field_of_study_id = ${host_field_of_study_id}`
          : "host_field_of_study_id is null"
      } 
      and testDay=${testDay} and testDayPart=${testDayPart}`
    );
    if (result2.length !== 0)
      return res
        .status(409)
        .json({ message: "روز امتحان با روز امتحان درس دیگری تداخل دارد" }); */

    // if we have not host_fos we should check schedule's conflict;
    // else, it means that we check conflict before and we just insert it with new host_fos
    if (host_field_of_study_id === -1) {
      // check for interferece week date in the db

      // we have two queries;
      // first query checks (class & time & weekKindClass & weekDay) for input_class_1 (and input_class_2 if its not -1) to be in db_class_1;
      // second query checks (class & time & weekKindClass & weekDay) for input_class_1 (and input_class_2 if its not -1) to be in db_class_2.

      const [result3, fields3] = await connection.execute(
        `select * from times where id = ${time1_id}`
      );
      // check time conflict for input_time1 with db_time1
      let time_clause1 = "";
      for (let i = result3[0].start; i < result3[0].end; i++) {
        time_clause1 += `(${i} between t1.start and (t1.end-1))`;
        if (i + 1 !== result3[0].end) {
          time_clause1 += " or ";
        }
      }
      // check time conflict for input_time1 with db_time2
      let time_clause11 = "";
      for (let i = result3[0].start; i < result3[0].end; i++) {
        time_clause11 += `(${i} between t2.start and (t2.end-1))`;
        if (i + 1 !== result3[0].end) {
          time_clause11 += " or ";
        }
      }
      let time_clause2 = "";
      let time_clause22 = "";
      // if class2_id is -1, our time2_id is -1 too; and we cant query on it.
      if (class2_id !== -1) {
        const [result4, fields4] = await connection.execute(
          `select * from times where id = ${time2_id}`
        );
        // check time conflict for input_time2 with db_time2
        for (let i = result4[0].start; i < result4[0].end; i++) {
          time_clause2 += `(${i} between t2.start and (t2.end-1))`;
          if (i + 1 !== result4[0].end) {
            time_clause2 += " or ";
          }
        }
        // check time conflict for input_time2 with db_time1
        for (let i = result4[0].start; i < result4[0].end; i++) {
          time_clause22 += `(${i} between t1.start and (t1.end-1))`;
          if (i + 1 !== result4[0].end) {
            time_clause22 += " or ";
          }
        }
      }
      // if wkc === 1 ? fail, if wkc === 2 ? req can be 3 else fail, if wkc === 3 ? req can be 2 else fail.
      // each query check if we have time conflic for any classes or any professors.
      const query = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c1.title as class_title, weekDay1 as weekDay, weekKindClass1 as weekKind, t1.start as time_start, t1.end as time_end, 
        professors.firstName as prof_firstName, professors.lastName as prof_lastName 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t1 on schedules.time1_id=t1.id 
        join classes c1 on schedules.class1_id=c1.id 
        join professors on schedules.professor_id = professors.id 
        where semester_id=${semester_id} and ((class1_id=${class1_id} or professor_id=${professor_id}) and (${time_clause1}) 
        and weekKindClass1 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay1})${
        class2_id === -1
          ? ""
          : ` 
        or ((class1_id=${class2_id} or professor_id=${professor_id}) and (${time_clause22}) 
        and weekKindClass1 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay2})`
      }`;

      const query2 = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c2.title as class_title, weekDay2 as weekDay, weekKindClass2 as weekKind, t2.start as time_start, t2.end as time_end, 
        professors.firstName as prof_firstName, professors.lastName as prof_lastName 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t2 on schedules.time2_id=t2.id 
        join classes c2 on schedules.class2_id=c2.id 
        join professors on schedules.professor_id = professors.id 
        where semester_id=${semester_id} and ((class2_id=${class1_id} or professor_id=${professor_id}) and (${time_clause11}) 
        and weekKindClass2 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay1})${
        class2_id === -1
          ? ""
          : ` 
        or ((class2_id=${class2_id} or professor_id=${professor_id}) and (${time_clause2}) 
        and weekKindClass2 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay2})`
      }`;
      const [result5, fields5] = await connection.execute(query);
      if (result5.length !== 0) return res.status(200).json(result5);

      const [result6, fields6] = await connection.execute(query2);
      if (result6.length !== 0) return res.status(200).json(result6);
    }

    // insertion
    const [result7, fields7] = await connection.execute(
      `insert into schedules (testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, weekKindClass2, 
      weekDay1, weekDay2, field_of_study_id, semester_id, course_id, professor_id, host_field_of_study_id, 
      class1_id, class2_id, submitter_user_id, accessibleFor_user_id, time1_id, time2_id) 
      values (${testDay}, ${testDayPart}, ${maxCapacity}, ${minCapacity}, ${courseGroup}, ${weekKindClass1}, 
      ${class2_id !== -1 ? weekKindClass2 : null}, ${weekDay1}, ${
        class2_id !== -1 ? weekDay2 : null
      }, ${req.user.field_of_study_id}, ${semester_id}, ${course_id}, 
      ${professor_id}, ${
        host_field_of_study_id !== -1 ? host_field_of_study_id : null
      }, ${class1_id}, ${class2_id !== -1 ? class2_id : null}, ${
        req.user.id
      }, ${accessibleFor_user_id !== -1 ? accessibleFor_user_id : null}, 
      ${time1_id}, ${class2_id !== -1 ? time2_id : null})`
    );

    res.status(201).json({ message: `برنامه مورد نظر با موفقیت ثبت شد` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const email_weekly_schedule = async (req, res) => {
  const { professor_id, semester_id } = req.body.data;
  if (!professor_id || !semester_id)
    return res.status(400).json({
      message: "اطلاعات ارسالی برای ایمیل برنامه ی هفتگی ناقص است",
    });

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  try {
    const [result00, fields00] = await connection.execute(
      `select email from professors where id=${professor_id}`
    );
    if (result00.length === 0)
      return res.status(400).json({ message: "آیدی استاد نامعتبر است" });

    const [result0, fields0] = await connection.execute(
      `select count(*) as count from schedules where professor_id=${professor_id} and semester_id = ${semester_id}`
    );
    if (result0[0].count === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای در این نیمسال برای این استاد وجود ندارد" });

    const [results, fields] = await connection.query(
      `select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass1 as weekKind 
      from schedules join times on schedules.time1_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay1=1 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass2 as weekKind 
      from schedules join times on schedules.time2_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay2=1 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass1 as weekKind 
      from schedules join times on schedules.time1_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay1=2 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass2 as weekKind 
      from schedules join times on schedules.time2_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay2=2 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass1 as weekKind 
      from schedules join times on schedules.time1_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay1=3 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass2 as weekKind 
      from schedules join times on schedules.time2_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay2=3 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass1 as weekKind 
      from schedules join times on schedules.time1_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay1=4 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass2 as weekKind 
      from schedules join times on schedules.time2_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay2=4 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass1 as weekKind 
      from schedules join times on schedules.time1_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay1=5 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass2 as weekKind 
      from schedules join times on schedules.time2_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay2=5 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass1 as weekKind 
      from schedules join times on schedules.time1_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay1=6 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null;
      select courses.name as course_name, times.start, times.end, courses.unit, weekKindClass2 as weekKind 
      from schedules join times on schedules.time2_id=times.id join courses on schedules.course_id=courses.id 
      where weekDay2=6 and schedules.semester_id = ${semester_id} and schedules.professor_id = ${professor_id} 
      and host_field_of_study_id is null`
    );

    const saturday = [...results[0], ...results[1]].sort(
      (a, b) => a.start - b.start
    );
    const sunday = [...results[2], ...results[3]].sort(
      (a, b) => a.start - b.start
    );
    const monday = [...results[4], ...results[5]].sort(
      (a, b) => a.start - b.start
    );
    const tuesday = [...results[6], ...results[7]].sort(
      (a, b) => a.start - b.start
    );
    const wednesday = [...results[8], ...results[9]].sort(
      (a, b) => a.start - b.start
    );
    const thursday = [...results[10], ...results[11]].sort(
      (a, b) => a.start - b.start
    );

    const schedule = {
      saturday,
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
    };
    ///////////////////////////////////////////////////////
    function generateWeeklyTds(day) {
      // first we map through the schedules and until reach the course.start, create empty tds; then create td with data.
      // if we are in last element in map, then create empty td to fix the row(keep appearance).
      // at last, if our input(day) is empty (we have no schedules at that day) we just create empty td to fix the row(keep appearance);
      // if not, we put created element from map together in a string and return back.

      let i = 7;

      const dayArray = day.map((course, idx, arr) => {
        let tds = "";
        while (i < course.start) {
          tds += "<td></td>";
          i++;
        }

        tds += `<td colspan="${course.end - course.start}" ${
          course.weekKind !== 1 ? 'class="not-stable"' : ""
        }>${
          course.course_name +
          ` (${course.unit})` +
          (course.weekKind !== 1
            ? ` (${course.weekKind === 2 ? "زوج" : "فرد"})`
            : "")
        }</td>`;

        i = course.end;

        if (idx + 1 === arr.length) {
          while (i < 21) {
            tds += "<td></td>";
            i++;
          }
        }

        return tds;
      });

      let result = "";
      if (day.length === 0) {
        let i = 0;
        while (i < 14) {
          result += "<td></td>";
          i++;
        }
      } else {
        dayArray.forEach((el) => {
          result += el;
        });
      }

      return result;
    }

    // create html code.
    const html_code = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          body{
              display: flex;
              justify-content: center;
              margin-top: 100px;
          }
          table,
          th,
          td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          table td, table th {
              width: 100px;
              text-align: center;
          }
          table td {
            height: 40px;
          }
          table {
            direction: rtl;
          }
          thead tr{
              background-color: rgb(250, 250, 11);
          }
          .not-stable{
            background-color: rgb(252, 215, 178);
          }
          p {
            margin-top: 20px;
            direction: rtl;
          }
        </style>
      </head>
      <body>
        <table id="simple_table">
          <thead>
            <tr>
              <th></th>
              <th>7</th>
              <th>8</th>
              <th>9</th>
              <th>10</th>
              <th>11</th>
              <th>12</th>
              <th>13</th>
              <th>14</th>
              <th>15</th>
              <th>16</th>
              <th>17</th>
              <th>18</th>
              <th>19</th>
              <th>20</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>شنبه</td>
              ${generateWeeklyTds(schedule.saturday)}
            </tr>
              <td>یکشنبه</td>
              ${generateWeeklyTds(schedule.sunday)}
            </tr>
            <tr>
              <td>دوشنبه</td>
              ${generateWeeklyTds(schedule.monday)}
            </tr>
            <tr>
              <td>سه شنبه</td>
              ${generateWeeklyTds(schedule.tuesday)}
            </tr>
            <tr>
              <td>چهارشنبه</td>
              ${generateWeeklyTds(schedule.wednesday)}
            </tr>
            <tr>
              <td>پنجشنبه</td>
              ${generateWeeklyTds(schedule.thursday)}
            </tr>
          </tbody>
        </table>
        <p>(این پیام از طریق سامانه ی سبد ارسال شده است. لطفا آنرا ریپلای نکنید)</p>
      </body>
    </html>
    `;

    // email to professor
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
      to: result00[0].email,
      subject: "برنامه ی هفتگی نیمسال جاری دانشگاه صنعتی بیرجند",
      html: html_code,
    };

    let info = await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "برنامه با موفقیت ایمیل شد" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا! لطفا دقایقی دیگر دوباره امتحان کنید" });
  } finally {
    connection.end();
  }
};

const email_test_schedule = async (req, res) => {
  const { professor_id, semester_id } = req.body.data;
  if (!professor_id || !semester_id)
    return res.status(400).json({
      message: "اطلاعات ارسالی برای ایمیل برنامه ی هفتگی ناقص است",
    });

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
    const [result00, fields00] = await connection.execute(
      `select email from professors where id=${professor_id}`
    );
    if (result00.length === 0)
      return res.status(400).json({ message: "آیدی استاد نامعتبر است" });

    const [result0, fields0] = await connection.execute(
      `select count(*) as count from schedules where professor_id = ${professor_id} and semester_id = ${semester_id}`
    );
    if (result0[0].count === 0)
      return res
        .status(400)
        .json({ message: "آیدی استاد یا نیمسال نامعتبر است" });

    const [result1, fields1] = await connection.execute(
      `select courses.name as course_name, testDay, testDayPart 
          from schedules join courses on schedules.course_id=courses.id 
          where host_field_of_study_id is null and courseGroup = 1 and 
          schedules.semester_id = ${semester_id} and professor_id = ${professor_id}`
    );

    const schedule = {
      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: [],
      sixth: [],
      seventh: [],
      eighth: [],
      ninth: [],
      tenth: [],
      eleventh: [],
      twelfth: [],
      thirteenth: [],
      fourteenth: [],
      out_of_range: [],
    };

    result1.forEach((sch) => {
      switch (sch.testDay) {
        case 1:
          schedule.first.push(sch);
          break;
        case 2:
          schedule.second.push(sch);
          break;
        case 3:
          schedule.third.push(sch);
          break;
        case 4:
          schedule.fourth.push(sch);
          break;
        case 5:
          schedule.fifth.push(sch);
          break;
        case 6:
          schedule.sixth.push(sch);
          break;
        case 7:
          schedule.seventh.push(sch);
          break;
        case 8:
          schedule.eighth.push(sch);
          break;
        case 9:
          schedule.ninth.push(sch);
          break;
        case 10:
          schedule.tenth.push(sch);
          break;
        case 11:
          schedule.eleventh.push(sch);
          break;
        case 12:
          schedule.twelfth.push(sch);
          break;
        case 13:
          schedule.thirteenth.push(sch);
          break;
        case 14:
          schedule.fourteenth.push(sch);
          break;
        case 15:
          schedule.out_of_range.push(sch);
          break;
        default:
          break;
      }
    });
    ////////////////////////////////////////////////////
    function generateTestTds(testDayArr, text) {
      // if we have no test at that day, we just return empty tds to keep appearance;
      // if we have more than one test in a day, first we create rows after first test; then we create first test.
      // at last, we append first test to result; if we have more tests, we append them too.

      if (testDayArr.length === 0) {
        return `<tr><td>${text}</td><td></td><td></td><td></td></tr>`;
      }

      let tr = "";
      if (testDayArr.length > 1) {
        // create rows after first test
        for (let i = 1; i < testDayArr.length; i++) {
          switch (testDayArr[i].testDayPart) {
            case 1:
              tr += `
              <tr>
                <td>${testDayArr[i].course_name}</td>
                <td></td>
                <td></td>
              </tr>`;
              break;
            case 2:
              tr += `
              <tr>
                <td></td>
                <td>${testDayArr[i].course_name}</td>
                <td></td>
              </tr>`;
              break;
            case 3:
              tr += `
              <tr>
                <td></td>
                <td></td>
                <td>${testDayArr[i].course_name}</td>
              </tr>`;
              break;
            default:
              break;
          }
        }
      }

      let result = "";

      // create first test row
      // if we have more test (created above) we bring it after first row.
      switch (testDayArr[0].testDayPart) {
        case 1:
          result += `
        <tr>
          <td rowspan="${testDayArr.length}">${text}</td>
          <td>${testDayArr[0].course_name}</td>
          <td></td>
          <td></td>
        </tr>
        ${tr}`;
          break;
        case 2:
          result += `
        <tr>
          <td rowspan="${testDayArr.length}">${text}</td>
          <td></td>
          <td>${testDayArr[0].course_name}</td>
          <td></td>
        </tr>
        ${tr}`;
          break;
        case 3:
          result += `
        <tr>
          <td rowspan="${testDayArr.length}">${text}</td>
          <td></td>
          <td></td>
          <td>${testDayArr[0].course_name}</td>
        </tr>
        ${tr}`;
          break;
        default:
          break;
      }

      return result;
    }

    // create html code.
    const html_code = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          body{
              display: flex;
              justify-content: center;
              margin-top: 50px;
          }
          table,
          th,
          td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          table td, table th {
              width: 100px;
              text-align: center;
          }
          table td {
            height: 40px;
          }
          table {
            direction: rtl;
          }
          thead tr{
              background-color: rgb(90, 195, 251);
          }
          p {
            margin-top: 20px;
            direction: rtl;
          }
        </style>
      </head>
      <body>
        <table id="simple_table">
          <thead>
            <tr>
              <th></th>
              <th>نوبت اول</th>
              <th>نوبت دوم</th>
              <th>نوبت سوم</th>
            </tr>
          </thead>
          <tbody>
            ${generateTestTds(schedule.first, "روز اول")}
            ${generateTestTds(schedule.second, "روز دوم")}
            ${generateTestTds(schedule.third, "روز سوم")}
            ${generateTestTds(schedule.fourth, "روز جهارم")}
            ${generateTestTds(schedule.fifth, "روز پنجم")}
            ${generateTestTds(schedule.sixth, "روز ششم")}
            ${generateTestTds(schedule.seventh, "روز هفتم")}
            ${generateTestTds(schedule.eighth, "روز هشتم")}
            ${generateTestTds(schedule.ninth, "روز نهم")}
            ${generateTestTds(schedule.tenth, "روز دهم")}
            ${generateTestTds(schedule.eleventh, "روز یازدهم")}
            ${generateTestTds(schedule.twelfth, "روز دوازدهم")}
            ${generateTestTds(schedule.thirteenth, "روز سیزدهم")}
            ${generateTestTds(schedule.fourteenth, "روز چهاردهم")}
            ${generateTestTds(schedule.out_of_range, "خارج از بازه")}
          </tbody>
        </table>
        <p>(این پیام از طریق سامانه ی سبد ارسال شده است. لطفا آنرا ریپلای نکنید)</p>
      </body>
    </html>
    `;

    // email to professor
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
      to: result00[0].email,
      subject: "برنامه ی امتحانی نیمسال جاری دانشگاه صنعتی بیرجند",
      html: html_code,
    };

    let info = await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "برنامه با موفقیت ایمیل شد" });

    //res.status(200).json(schedule);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا! لطفا دقایقی دیگر دوباره امتحان کنید" });
  } finally {
    connection.end();
  }
};

const get_class_schedules = async (req, res) => {
  const class_id = parseInt(req.query.class_id);
  if (!class_id)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای دریافت برنامه ی کلاس ناقص است" });

  //connect to db
  let connection;
  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در برقراری ارتباط با پایگاه داده" });
  }

  try {
    // check for existing id in the db
    const [result13, fields13] = await connection.execute(
      `select title from classes where id=${class_id}`
    );

    if (result13.length === 0)
      return res.status(400).json({ message: "درخواست نامعتبر" });

    const [result0, fields0] = await connection.execute(
      `SELECT id FROM semesters ORDER BY ID DESC LIMIT 1`
    );
    const semester_id = result0[0].id;

    // here we query multiple statements by spliting each query by semicolon.
    // as an example, query one, gets schedules with class1 matching which hold in saturday; second query does this for class2s.
    // and other queries do this for other days.
    const [results, fields] = await connection.query(
      `select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=1 and class1_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=1 and class2_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=2 and class1_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=2 and class2_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=3 and class1_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=3 and class2_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=4 and class1_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=4 and class2_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=5 and class1_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=5 and class2_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=6 and class1_id=${class_id} and semester_id = ${semester_id};
      select schedules.id as schedule_id, courses.name as course_name, courses.unit, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=6 and class2_id=${class_id} and semester_id = ${semester_id}`
    );

    /*     const saturday = [...results[0], ...results[1]];
    const sunday = [...results[2], ...results[3]];
    const monday = [...results[4], ...results[5]];
    const tuesday = [...results[6], ...results[7]];
    const wednesday = [...results[8], ...results[9]];
    const thursday = [...results[10], ...results[11]]; */

    const saturday = [...results[0], ...results[1]].sort(
      (a, b) => a.start - b.start
    );
    const sunday = [...results[2], ...results[3]].sort(
      (a, b) => a.start - b.start
    );
    const monday = [...results[4], ...results[5]].sort(
      (a, b) => a.start - b.start
    );
    const tuesday = [...results[6], ...results[7]].sort(
      (a, b) => a.start - b.start
    );
    const wednesday = [...results[8], ...results[9]].sort(
      (a, b) => a.start - b.start
    );
    const thursday = [...results[10], ...results[11]].sort(
      (a, b) => a.start - b.start
    );

    const class_schedule = {
      saturday,
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
    };
    const result = {
      class_title: result13[0].title,
      class_schedule,
    };
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_schedule = async (req, res) => {
  const {
    id,
    testDay,
    testDayPart,
    maxCapacity,
    minCapacity,
    courseGroup,
    weekKindClass1,
    weekKindClass2,
    weekDay1,
    weekDay2,
    course_id,
    professor_id,
    host_field_of_study_id,
    class1_id,
    class2_id,
    time1_id,
    time2_id,
  } = req.body.data;
  if (
    !id ||
    !testDay ||
    !testDayPart ||
    !maxCapacity ||
    !minCapacity ||
    !courseGroup ||
    !weekKindClass1 ||
    !weekKindClass2 ||
    !weekDay1 ||
    !weekDay2 ||
    !course_id ||
    !professor_id ||
    !host_field_of_study_id ||
    !class1_id ||
    !class2_id ||
    !time1_id ||
    !time2_id
  )
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای ویرایش برنامه ناقص است" });

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
      `select count(*) as count from schedules where id=${id}`
    );

    if (result0[0].count === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    // fetch last semester_id
    const [result00, fields00] = await connection.execute(
      `SELECT id FROM semesters ORDER BY ID DESC LIMIT 1`
    );
    const semester_id = result00[0].id;

    // if user wants to use host_fos, check that do we have this input_schedule in the db;
    // if we have, the db_data is the same as input_data but host_fos = null.
    if (host_field_of_study_id !== -1) {
      const [result01, fields01] = await connection.execute(
        `select count(*) as count from schedules 
      where testDay = ${testDay} and testDayPart = ${testDayPart} and maxCapacity = ${maxCapacity} 
      and minCapacity = ${minCapacity} and courseGroup = ${courseGroup} and weekKindClass1 = ${weekKindClass1} 
      and ${
        class2_id !== -1
          ? `weekKindClass2 = ${weekKindClass2}`
          : "weekKindClass2 is null"
      } and weekDay1 = ${weekDay1} 
      and ${class2_id !== -1 ? `weekDay2 = ${weekDay2}` : "weekDay2 is null"} 
      and field_of_study_id = ${host_field_of_study_id} and semester_id = ${semester_id} and course_id = ${course_id} 
      and professor_id = ${professor_id} and host_field_of_study_id is null and class1_id = ${class1_id} 
      and class2_id = ${
        class2_id !== -1 ? `class2_id = ${class2_id}` : "class2_id is null"
      } 
      and ${
        accessibleFor_user_id === -1
          ? "accessibleFor_user_id is null"
          : `accessibleFor_user_id = ${accessibleFor_user_id}`
      } and time1_id = ${time1_id} 
      and time2_id = ${
        class2_id !== -1 ? `time2_id = ${time2_id}` : "time2_id is null"
      }`
      );
      if (result01[0].count === 0)
        return res.status(400).json({
          message: "این درس هنوز تعریف نشده و نمی توان از آن میزبانی گرفت",
        });
    }

    // check for duplicate schedule in the db
    const [result1, fields1] = await connection.execute(
      `select id from schedules 
      where semester_id=${semester_id} and ${
        host_field_of_study_id !== -1
          ? `host_field_of_study_id = ${host_field_of_study_id}`
          : "host_field_of_study_id is null"
      } 
      and course_id=${course_id} and courseGroup=${courseGroup}`
    );
    if (result1.length !== 0 && result1[0].id !== id)
      return res
        .status(409)
        .json({ message: "این درس قبلا در برنامه اضافه شده است" });

    // check for interferece test date in the db
    /*     const [result2, fields2] = await connection.execute(
      `select id from schedules 
      where semester_id=${semester_id} and ${
        host_field_of_study_id !== -1
          ? `host_field_of_study_id = ${host_field_of_study_id}`
          : "host_field_of_study_id is null"
      } 
      and testDay=${testDay} and testDayPart=${testDayPart}`
    );
    if (result2.length !== 0 && result2[0].id !== id)
      return res
        .status(409)
        .json({ message: "روز امتحان با روز امتحان درس دیگری تداخل دارد" }); */

    // check for interferece week date in the db
    /*
        we have two queries;
        first query checks (class & time & weekKindClass & weekDay) for input_class_1 (and input_class_2 if its not -1) to be in db_class_1;
        second query checks (class & time & weekKindClass & weekDay) for input_class_1 (and input_class_2 if its not -1) to be in db_class_2.
    */
    // if we have not host_fos we should check schedule's conflict;
    // else, it means that we check conflict before and we just insert it with new host_fos
    if (host_field_of_study_id === -1) {
      const [result3, fields3] = await connection.execute(
        `select * from times where id = ${time1_id}`
      );
      // check time conflict for input_time1 with db_time1
      let time_clause1 = "";
      for (let i = result3[0].start; i < result3[0].end; i++) {
        time_clause1 += `(${i} between t1.start and (t1.end-1))`;
        if (i + 1 !== result3[0].end) {
          time_clause1 += " or ";
        }
      }
      // check time conflict for input_time1 with db_time2
      let time_clause11 = "";
      for (let i = result3[0].start; i < result3[0].end; i++) {
        time_clause11 += `(${i} between t2.start and (t2.end-1))`;
        if (i + 1 !== result3[0].end) {
          time_clause11 += " or ";
        }
      }
      let time_clause2 = "";
      let time_clause22 = "";
      // if class2_id is -1, out time2_id is -1 too; and we cant query on it.
      if (class2_id !== -1) {
        const [result4, fields4] = await connection.execute(
          `select * from times where id = ${time2_id}`
        );
        // check time conflict for input_time2 with db_time2
        for (let i = result4[0].start; i < result4[0].end; i++) {
          time_clause2 += `(${i} between t2.start and (t2.end-1))`;
          if (i + 1 !== result4[0].end) {
            time_clause2 += " or ";
          }
        }
        // check time conflict for input_time2 with db_time1
        for (let i = result4[0].start; i < result4[0].end; i++) {
          time_clause22 += `(${i} between t1.start and (t1.end-1))`;
          if (i + 1 !== result4[0].end) {
            time_clause22 += " or ";
          }
        }
      }
      // if wkc === 1 ? fail, if wkc === 2 ? req can be 3 else fail, if wkc === 3 ? req can be 2 else fail.
      // each query check if we have time conflic for any classes or any professors.
      const query = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c1.title as class_title, weekDay1 as weekDay, weekKindClass1 as weekKind, t1.start as time_start, t1.end as time_end, 
        professors.firstName as prof_firstName, professors.lastName as prof_lastName 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t1 on schedules.time1_id=t1.id 
        join classes c1 on schedules.class1_id=c1.id 
        join professors on schedules.professor_id = professors.id 
        where semester_id=${semester_id} and schedules.id <> ${id} and ((class1_id=${class1_id} or professor_id=${professor_id}) and (${time_clause1}) 
        and weekKindClass1 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay1})${
        class2_id === -1
          ? ""
          : ` 
        or ((class1_id=${class2_id} or professor_id=${professor_id}) and (${time_clause22}) 
        and weekKindClass1 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay2})`
      }`;

      const query2 = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c2.title as class_title, weekDay2 as weekDay, weekKindClass2 as weekKind, t2.start as time_start, t2.end as time_end, 
        professors.firstName as prof_firstName, professors.lastName as prof_lastName 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t2 on schedules.time2_id=t2.id 
        join classes c2 on schedules.class2_id=c2.id 
        join professors on schedules.professor_id = professors.id 
        where semester_id=${semester_id} and schedules.id <> ${id} and ((class2_id=${class1_id} or professor_id=${professor_id}) and (${time_clause11}) 
        and weekKindClass2 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay1})${
        class2_id === -1
          ? ""
          : ` 
        or ((class2_id=${class2_id} or professor_id=${professor_id}) and (${time_clause2}) 
        and weekKindClass2 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay2})`
      }`;
      const [result5, fields5] = await connection.execute(query);
      if (result5.length !== 0) return res.status(200).json(result5);

      const [result6, fields6] = await connection.execute(query2);
      if (result6.length !== 0) return res.status(200).json(result6);
    }

    const [result7, fields7] = await connection.execute(
      `update schedules set testDay=${testDay}, testDayPart=${testDayPart}, maxCapacity=${maxCapacity}, 
      minCapacity=${minCapacity}, courseGroup=${courseGroup}, weekKindClass1=${weekKindClass1}, 
      weekKindClass2=${
        class2_id !== -1 ? weekKindClass2 : null
      }, weekDay1=${weekDay1}, weekDay2=${class2_id !== -1 ? weekDay2 : null}, 
      course_id=${course_id}, professor_id=${professor_id}, 
      host_field_of_study_id=${
        host_field_of_study_id !== -1 ? host_field_of_study_id : null
      }, class1_id=${class1_id}, class2_id=${
        class2_id !== -1 ? class2_id : null
      }, 
      submitter_user_id=${req.user.id}, time1_id=${time1_id}, 
      time2_id=${class2_id !== -1 ? time2_id : null} where id = ${id}`
    );

    res.status(201).json({ message: `برنامه مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_schedule_state = async (req, res) => {
  const { id } = req.body.data;
  if (!id)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای تغییر وضعیت برنامه ناقص است" });

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
      `select isCertain from schedules where id=${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    if (result1[0].isCertain) {
      const [result2, fields2] = await connection.execute(
        `update schedules set isCertain = false where id = ${id}`
      );
    } else {
      const [result2, fields2] = await connection.execute(
        `update schedules set isCertain = true where id = ${id}`
      );
    }

    res
      .status(201)
      .json({ message: `وضعیت درس مورد نظر با موفقیت تغییر پیدا کرد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const delete_schedule = async (req, res) => {
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
      `select count(*) as count from schedules where id = ${id}`
    );

    if (result1[0].count === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    const [result2, fields2] = await connection.execute(
      `delete from schedules where id = ${id}`
    );

    res.status(200).json({ message: `برنامه ی مورد نظر با موفقیت حذف شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

module.exports = {
  get_all,
  get_weekly_schedules_by_filter,
  get_test_schedules_by_filter,
  get_schedule,
  create_schedule,
  email_weekly_schedule,
  email_test_schedule,
  get_class_schedules,
  update_schedule,
  update_schedule_state,
  delete_schedule,
};
