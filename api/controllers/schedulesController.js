const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_all = async (req, res) => {
  const { semester_id } = req.body;
  if (!semester_id)
    return res.status(400).json({
      message: "اطلاعات ارسالی برای گرفتن برنامه های درسی ناقص است",
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
  const { id, role, field_of_study_id } = req.user;
  // role === 2 ? schedules.field_of_study_id = field_of_study_id
  // role === 3 ? schedules.accessibleFor_user_id = id

  // the difference of these 4 queries is on where clause for class2_id and host_fos to have null value or not.
  const query1 = `select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, 
    weekKindClass2, weekDay1, weekDay2, isCertain, 
    schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, 
    courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, 
    schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, 
    fos1.id as fos_id, fos1.name as fos_name, fos2.id as host_fos_id, fos2.name as host_fos_name, 
    users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, 
    users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, 
    classes1.id as class1_id, classes1.title as class1_title, classes2.id as class2_id, classes2.title as class2_title, 
    times1.id as time1_id, times1.start as time1_start, times1.end as time1_end, 
    times2.id as time2_id, times2.start as time2_start, times2.end as time2_end 
    from schedules join semesters on schedules.semester_id=semesters.id 
    join courses courses1 on schedules.course_id=courses1.id 
    join courses courses2 on courses1.prerequisite_id=courses2.id 
    join courses courses3 on courses1.need_id=courses3.id 
    join professors on schedules.professor_id=professors.id 
    join field_of_studies fos1 on schedules.field_of_study_id=fos1.id 
    join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id
    join users users1 on schedules.submitter_user_id=users1.id 
    join users users2 on schedules.accessibleFor_user_id=users2.id 
    join classes classes1 on schedules.class1_id=classes1.id 
    join classes classes2 on schedules.class2_id=classes2.id 
    join times times1 on schedules.time1_id=times1.id 
    join times times2 on schedules.time2_id=times2.id 
    where schedules.semester_id = ${semester_id} and class2_id is not null and host_field_of_study_id is not null 
    and ${
      role === 2
        ? `schedules.field_of_study_id = ${field_of_study_id}`
        : `schedules.accessibleFor_user_id = ${id}`
    }`;

  const query2 = `select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, 
    weekDay1, isCertain, schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, 
    courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, 
    schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, 
    fos1.id as fos_id, fos1.name as fos_name, fos2.id as host_fos_id, fos2.name as host_fos_name, 
    users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, 
    users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, 
    classes1.id as class1_id, classes1.title as class1_title, 
    times1.id as time1_id, times1.start as time1_start, times1.end as time1_end 
    from schedules join semesters on schedules.semester_id=semesters.id 
    join courses courses1 on schedules.course_id=courses1.id 
    join courses courses2 on courses1.prerequisite_id=courses2.id 
    join courses courses3 on courses1.need_id=courses3.id 
    join professors on schedules.professor_id=professors.id 
    join field_of_studies fos1 on schedules.field_of_study_id=fos1.id 
    join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id
    join users users1 on schedules.submitter_user_id=users1.id 
    join users users2 on schedules.accessibleFor_user_id=users2.id 
    join classes classes1 on schedules.class1_id=classes1.id 
    join times times1 on schedules.time1_id=times1.id 
    where schedules.semester_id = ${semester_id} and class2_id is null and host_field_of_study_id is not null 
    and ${
      role === 2
        ? `schedules.field_of_study_id = ${field_of_study_id}`
        : `schedules.accessibleFor_user_id = ${id}`
    }`;

  const query3 = `select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, 
    weekKindClass2, weekDay1, weekDay2, isCertain, 
    schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, 
    courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, 
    schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, 
    fos1.id as fos_id, fos1.name as fos_name, 
    users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, 
    users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, 
    classes1.id as class1_id, classes1.title as class1_title, classes2.id as class2_id, classes2.title as class2_title, 
    times1.id as time1_id, times1.start as time1_start, times1.end as time1_end, 
    times2.id as time2_id, times2.start as time2_start, times2.end as time2_end 
    from schedules join semesters on schedules.semester_id=semesters.id 
    join courses courses1 on schedules.course_id=courses1.id 
    join courses courses2 on courses1.prerequisite_id=courses2.id 
    join courses courses3 on courses1.need_id=courses3.id 
    join professors on schedules.professor_id=professors.id 
    join field_of_studies fos1 on schedules.field_of_study_id=fos1.id 
    join users users1 on schedules.submitter_user_id=users1.id 
    join users users2 on schedules.accessibleFor_user_id=users2.id 
    join classes classes1 on schedules.class1_id=classes1.id 
    join classes classes2 on schedules.class2_id=classes2.id 
    join times times1 on schedules.time1_id=times1.id 
    join times times2 on schedules.time2_id=times2.id 
    where schedules.semester_id = ${semester_id} and class2_id is not null and host_field_of_study_id is null 
    and ${
      role === 2
        ? `schedules.field_of_study_id = ${field_of_study_id}`
        : `schedules.accessibleFor_user_id = ${id}`
    }`;

  const query4 = `select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, 
    weekDay1, isCertain, schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, 
    courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, 
    schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, 
    fos1.id as fos_id, fos1.name as fos_name, 
    users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, 
    users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, 
    classes1.id as class1_id, classes1.title as class1_title, 
    times1.id as time1_id, times1.start as time1_start, times1.end as time1_end 
    from schedules join semesters on schedules.semester_id=semesters.id 
    join courses courses1 on schedules.course_id=courses1.id 
    join courses courses2 on courses1.prerequisite_id=courses2.id 
    join courses courses3 on courses1.need_id=courses3.id 
    join professors on schedules.professor_id=professors.id 
    join field_of_studies fos1 on schedules.field_of_study_id=fos1.id 
    join users users1 on schedules.submitter_user_id=users1.id 
    join users users2 on schedules.accessibleFor_user_id=users2.id 
    join classes classes1 on schedules.class1_id=classes1.id 
    join times times1 on schedules.time1_id=times1.id 
    where schedules.semester_id = ${semester_id} and class2_id is null and host_field_of_study_id is null 
    and ${
      role === 2
        ? `schedules.field_of_study_id = ${field_of_study_id}`
        : `schedules.accessibleFor_user_id = ${id}`
    }`;

  try {
    const [result1, fields1] = await connection.execute(query1);
    const [result2, fields2] = await connection.execute(query2);
    const [result3, fields3] = await connection.execute(query3);
    const [result4, fields4] = await connection.execute(query4);
    res.status(200).json([...result1, ...result2, ...result3, ...result4]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const get_weekly_schedules_by_filter = async (req, res) => {
  const { field_of_study_id, professor_id, termNumber, class_id, semester_id } =
    req.body;
  if (
    !field_of_study_id ||
    !professor_id ||
    !termNumber ||
    !class_id ||
    !semester_id
  )
    return res.status(400).json({
      message: "اطلاعات ارسالی برای فیلتر کردن برنامه ی هفتگی ناقص است",
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
    const [result1, fields1] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=1 and schedules.semester_id = ${semester_id}${where_clause}`
    );
    const [result2, fields2] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=1 and schedules.semester_id = ${semester_id}${where_clause2}`
    );
    const saturday = [...result1, ...result2];

    const [result3, fields3] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=2 and schedules.semester_id = ${semester_id}${where_clause}`
    );
    const [result4, fields4] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=2 and schedules.semester_id = ${semester_id}${where_clause2}`
    );
    const sunday = [...result3, ...result4];

    const [result5, fields5] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=3 and schedules.semester_id = ${semester_id}${where_clause}`
    );
    const [result6, fields6] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=3 and schedules.semester_id = ${semester_id}${where_clause2}`
    );
    const monday = [...result5, ...result6];

    const [result7, fields7] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=4 and schedules.semester_id = ${semester_id}${where_clause}`
    );
    const [result8, fields8] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=4 and schedules.semester_id = ${semester_id}${where_clause2}`
    );
    const tuesday = [...result7, ...result8];

    const [result9, fields9] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=5 and schedules.semester_id = ${semester_id}${where_clause}`
    );
    const [result10, fields10] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=5 and schedules.semester_id = ${semester_id}${where_clause2}`
    );
    const wednesday = [...result9, ...result10];

    const [result11, fields11] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=6 and schedules.semester_id = ${semester_id}${where_clause}`
    );
    const [result12, fields12] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay2=6 and schedules.semester_id = ${semester_id}${where_clause2}`
    );
    const thursday = [...result11, ...result12];

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
  const { field_of_study_id, professor_id, termNumber, semester_id } = req.body;
  if (!field_of_study_id || !professor_id || !termNumber || !semester_id)
    return res.status(400).json({
      message: "اطلاعات ارسالی برای فیلتر کردن برنامه ی امتحانی ناقص است",
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
    where_clause += "host_field_of_study_id is null";
  } else {
    where_clause += " and host_field_of_study_id is null";
  }
  // host_field_of_study_id is null: maybe we have some db_schedules with same data and different host_fos;
  // we want to fetch just the main one (that has null host_fos).

  try {
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
        default:
          break;
      }
    });

    res.status(200).json(schedule);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
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
      `select * from schedules where id = ${id}`
    );

    if (result1.length === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    const [result3, fields3] = await connection.execute(
      `select class2_id, host_field_of_study_id from schedules where id = ${id}`
    );
    let query = "";
    if (result3[0].class2_id) {
      query =
        "select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, weekKindClass2, weekDay1, weekDay2, isCertain, " +
        "schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, " +
        "schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, " +
        `fos1.id as fos_id, fos1.name as fos_name${
          result3[0].host_field_of_study_id
            ? ", fos2.id as host_fos_id, fos2.name as host_fos_name"
            : ""
        }, users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, ` +
        "users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, " +
        "classes1.id as class1_id, classes1.title as class1_title, classes2.id as class2_id, classes2.title as class2_title, " +
        "times1.id as time1_id, times1.start as time1_start, times1.end as time1_end, times2.id as time2_id, times2.start as time2_start, times2.end as time2_end " +
        "from schedules join semesters on schedules.semester_id=semesters.id " +
        "join courses courses1 on schedules.course_id=courses1.id " +
        "join courses courses2 on courses1.prerequisite_id=courses2.id " +
        "join courses courses3 on courses1.need_id=courses3.id " +
        "join professors on schedules.professor_id=professors.id " +
        `join field_of_studies fos1 on schedules.field_of_study_id=fos1.id ${
          result3[0].host_field_of_study_id
            ? "join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id "
            : ""
        }` +
        "join users users1 on schedules.submitter_user_id=users1.id " +
        "join users users2 on schedules.accessibleFor_user_id=users2.id " +
        "join classes classes1 on schedules.class1_id=classes1.id " +
        "join classes classes2 on schedules.class2_id=classes2.id " +
        "join times times1 on schedules.time1_id=times1.id " +
        "join times times2 on schedules.time2_id=times2.id " +
        `where schedules.id=${id}`;
    } else {
      query =
        "select schedules.id, testDay, testDayPart, maxCapacity, minCapacity, courseGroup, weekKindClass1, weekDay1, isCertain, " +
        "schedules.semester_id, semesters.yearPart, schedules.course_id, courses1.name as course_name, courses2.id as prerequisite_id, courses2.name as prerequisite_name, courses3.id as need_id, courses3.name as need_name, " +
        "schedules.professor_id, professors.firstName as professor_firstName, professors.lastName as professor_lastName, " +
        `fos1.id as fos_id, fos1.name as fos_name${
          result3[0].host_field_of_study_id
            ? ", fos2.id as host_fos_id, fos2.name as host_fos_name"
            : ""
        }, users1.id as submitter_id, users1.firstName as submitter_firstName, users1.lastName as submitter_lastName, ` +
        "users2.id as accessibleFor_id, users2.firstName as accessibleFor_firstName, users2.lastName as accessibleFor_lastName, " +
        "classes1.id as class1_id, classes1.title as class1_title, " +
        "times1.id as time1_id, times1.start as time1_start, times1.end as time1_end " +
        "from schedules join semesters on schedules.semester_id=semesters.id " +
        "join courses courses1 on schedules.course_id=courses1.id " +
        "join courses courses2 on courses1.prerequisite_id=courses2.id " +
        "join courses courses3 on courses1.need_id=courses3.id " +
        "join professors on schedules.professor_id=professors.id " +
        `join field_of_studies fos1 on schedules.field_of_study_id=fos1.id ${
          result3[0].host_field_of_study_id
            ? "join field_of_studies fos2 on schedules.host_field_of_study_id=fos2.id "
            : ""
        }` +
        "join users users1 on schedules.submitter_user_id=users1.id " +
        "join users users2 on schedules.accessibleFor_user_id=users2.id " +
        "join classes classes1 on schedules.class1_id=classes1.id " +
        "join times times1 on schedules.time1_id=times1.id " +
        `where schedules.id=${id}`;
    }

    const [result2, fields2] = await connection.execute(query);

    res.status(200).json(result2[0]);
  } catch (error) {
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
    semester_id,
    course_id,
    professor_id,
    host_field_of_study_id,
    class1_id,
    class2_id,
    accessibleFor_user_id,
    time1_id,
    time2_id,
  } = req.body;
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
    !semester_id ||
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
    // if we have host_fos, it means that input_schedule is the same as one of db_schedule, but with different host_fos.

    // if user wants to use host_fos, check that do we have this input_schedule in the db;
    // if we have, the db_data is the same as input_data but host_fos = null.
    if (host_field_of_study_id !== -1) {
      const [result0, fields0] = await connection.execute(
        `select * from schedules 
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
      and accessibleFor_user_id = ${accessibleFor_user_id} and time1_id = ${time1_id} 
      and time2_id = ${
        class2_id !== -1 ? `time2_id = ${time2_id}` : "time2_id is null"
      }`
      );
      if (result0.length === 0)
        return res.status(400).json({
          message: "این درس هنوز تعریف نشده و نمی توان از آن میزبانی گرفت",
        });
    }

    // check for duplicate schedule in the db
    const [result1, fields1] = await connection.execute(
      `select * from schedules 
      where semester_id=${semester_id} and ${
        host_field_of_study_id !== -1
          ? `host_field_of_study_id = ${host_field_of_study_id}`
          : "host_field_of_study_id is null"
      } 
      and course_id=${course_id} and courseGroup=${courseGroup}`
    );
    if (result1.length !== 0)
      return res
        .status(409)
        .json({ message: "این درس قبلا در برنامه اضافه شده است" });

    // check for interferece test date in the db
    const [result2, fields2] = await connection.execute(
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
        .json({ message: "روز امتحان با روز امتحان درس دیگری تداخل دارد" });

    // if we have not host_fos we should check schedule's conflict;
    // else, it means that we check conflict before and we just insert it with new host_fos
    if (host_field_of_study_id === -1) {
      // check for interferece week date in the db
      /*
        we have two queries;
        first query checks (class & time & weekKindClass & weekDay) for input_class_1 (and input_class_2 if its not -1) to be in db_class_1;
        second query checks (class & time & weekKindClass & weekDay) for input_class_1 (and input_class_2 if its not -1) to be in db_class_2.
    */
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
      const query = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c1.title as class1_title, weekDay1, weekKindClass1, t1.start as time_start1, t1.end as time_end1 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t1 on schedules.time1_id=t1.id 
        join classes c1 on schedules.class1_id=c1.id 
        where semester_id=${semester_id} and ((class1_id=${class1_id} and (${time_clause1}) 
        and weekKindClass1 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay1}))${
        class2_id === -1
          ? ""
          : ` 
        or ((class1_id=${class2_id} and (${time_clause22}) 
        and weekKindClass1 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay2}))`
      }`;

      const query2 = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c2.title as class2_title, weekDay2, weekKindClass2, t2.start as time_start2, t2.end as time_end1 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t2 on schedules.time2_id=t2.id 
        join classes c2 on schedules.class2_id=c2.id 
        where semester_id=${semester_id} and ((class2_id=${class1_id} and (${time_clause11}) 
        and weekKindClass2 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay1}))${
        class2_id === -1
          ? ""
          : ` 
        or ((class2_id=${class2_id} and (${time_clause2}) 
        and weekKindClass2 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay2}))`
      }`;
      const [result5, fields5] = await connection.execute(query);
      if (result5.length !== 0) return res.status(409).json(result5);

      const [result6, fields6] = await connection.execute(query2);
      if (result6.length !== 0) return res.status(409).json(result6);
    }

    // insertiion
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
      }, ${accessibleFor_user_id}, 
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
  const { professor_id, semester_id } = req.body;
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
    const [result1, fields1] = await connection.execute(
      `select * from schedules where professor_id=${professor_id} and semester_id = ${semester_id}`
    );
    if (result1.length === 0)
      return res.status(400).json({ message: "آیدی استاد نامعتبر است" });

    result1.forEach((sch) => {});

    res.status(200).json(result1);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const email_test_schedule = async (req, res) => {
  const { professor_id, semester_id } = req.body;
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
    const [result1, fields1] = await connection.execute(
      `select * from schedules where professor_id = ${professor_id} and semester_id = ${semester_id}`
    );
    if (result1.length === 0)
      return res.status(400).json({ message: "آیدی استاد نامعتبر است" });

    result1.forEach((sch) => {});

    res.status(200).json(result1);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const get_class_schedules = async (req, res) => {
  const { class_id, semester_id } = req.body;
  if (!class_id || !semester_id)
    return res
      .status(400)
      .json({ message: "اطلاعات ارسالی برای دریافت برنامه ی کلاس ناقص است" });

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
    const [result13, fields13] = await connection.execute(
      `select title from classes where id=${class_id}`
    );

    if (result13.length === 0)
      return res
        .status(400)
        .json({ message: "کلاسی مطابق با آیدی ارسالی وجود ندارد" });

    const [result1, fields1] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=1 and class1_id=${class_id} and semester_id = ${semester_id}`
    );
    const [result2, fields2] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=1 and class2_id=${class_id} and semester_id = ${semester_id}`
    );
    const saturday = [...result1, ...result2];

    const [result3, fields3] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=2 and class1_id=${class_id} and semester_id = ${semester_id}`
    );
    const [result4, fields4] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=2 and class2_id=${class_id} and semester_id = ${semester_id}`
    );
    const sunday = [...result3, ...result4];

    const [result5, fields5] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=3 and class1_id=${class_id} and semester_id = ${semester_id}`
    );
    const [result6, fields6] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=3 and class2_id=${class_id} and semester_id = ${semester_id}`
    );
    const monday = [...result5, ...result6];

    const [result7, fields7] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=4 and class1_id=${class_id} and semester_id = ${semester_id}`
    );
    const [result8, fields8] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=4 and class2_id=${class_id} and semester_id = ${semester_id}`
    );
    const tuesday = [...result7, ...result8];

    const [result9, fields9] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=5 and class1_id=${class_id} and semester_id = ${semester_id}`
    );
    const [result10, fields10] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=5 and class2_id=${class_id} and semester_id = ${semester_id}`
    );
    const wednesday = [...result9, ...result10];

    const [result11, fields11] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass1 as weekKind from schedules join times on schedules.time1_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
      where weekDay1=6 and class1_id=${class_id} and semester_id = ${semester_id}`
    );
    const [result12, fields12] = await connection.execute(
      `select schedules.id as schedule_id, courses.name as course_name, field_of_studies.name as field_of_study_name, times.start, 
      times.end, weekKindClass2 as weekKind from schedules join times on schedules.time2_id=times.id 
      join courses on schedules.course_id=courses.id join field_of_studies on schedules.field_of_study_id=field_of_studies.id   
      where weekDay2=6 and class2_id=${class_id} and semester_id = ${semester_id}`
    );
    const thursday = [...result11, ...result12];

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
    semester_id,
    course_id,
    professor_id,
    host_field_of_study_id,
    class1_id,
    class2_id,
    accessibleFor_user_id,
    time1_id,
    time2_id,
  } = req.body;
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
    !semester_id ||
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
      `select * from schedules where id=${id}`
    );

    if (result0.length === 0)
      return res
        .status(400)
        .json({ message: "برنامه ای مطابق با آیدی ارسالی وجود ندارد" });

    // if user wants to use host_fos, check that do we have this input_schedule in the db;
    // if we have, the db_data is the same as input_data but host_fos = null.
    if (host_field_of_study_id !== -1) {
      const [result01, fields01] = await connection.execute(
        `select * from schedules 
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
      and accessibleFor_user_id = ${accessibleFor_user_id} and time1_id = ${time1_id} 
      and time2_id = ${
        class2_id !== -1 ? `time2_id = ${time2_id}` : "time2_id is null"
      }`
      );
      if (result01.length === 0)
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
    const [result2, fields2] = await connection.execute(
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
        .json({ message: "روز امتحان با روز امتحان درس دیگری تداخل دارد" });

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
      const query = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c1.title as class1_title, weekDay1, weekKindClass1, t1.start as time_start1, t1.end as time_end1 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t1 on schedules.time1_id=t1.id 
        join classes c1 on schedules.class1_id=c1.id 
        where semester_id=${semester_id} and ((class1_id=${class1_id} and (${time_clause1}) 
        and weekKindClass1 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay1}))${
        class2_id === -1
          ? ""
          : ` 
        or ((class1_id=${class2_id} and (${time_clause22}) 
        and weekKindClass1 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay1=${weekDay2}))`
      }`;

      const query2 = `select courses.name as course_name, field_of_studies.name as field_of_study_name, 
        c2.title as class2_title, weekDay2, weekKindClass2, t2.start as time_start2, t2.end as time_end1 
        from schedules join courses on schedules.course_id=courses.id 
        join field_of_studies on schedules.field_of_study_id=field_of_studies.id 
        join times t2 on schedules.time2_id=t2.id 
        join classes c2 on schedules.class2_id=c2.id 
        where semester_id=${semester_id} and ((class2_id=${class1_id} and (${time_clause11}) 
        and weekKindClass2 in (${
          weekKindClass1 === 2
            ? [1, 2]
            : weekKindClass1 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay1}))${
        class2_id === -1
          ? ""
          : ` 
        or ((class2_id=${class2_id} and (${time_clause2}) 
        and weekKindClass2 in (${
          weekKindClass2 === 2
            ? [1, 2]
            : weekKindClass2 === 3
            ? [1, 3]
            : [1, 2, 3]
        }) and weekDay2=${weekDay2}))`
      }`;
      const [result5, fields5] = await connection.execute(query);
      if (result5.length !== 0) return res.status(409).json(result5);

      const [result6, fields6] = await connection.execute(query2);
      if (result6.length !== 0) return res.status(409).json(result6);
    }

    const [result7, fields7] = await connection.execute(
      `update schedules set testDay=${testDay}, testDayPart=${testDayPart}, maxCapacity=${maxCapacity}, 
      minCapacity=${minCapacity}, courseGroup=${courseGroup}, weekKindClass1=${weekKindClass1}, 
      weekKindClass2=${
        class2_id !== -1 ? weekKindClass2 : null
      }, weekDay1=${weekDay1}, weekDay2=${class2_id !== -1 ? weekDay2 : null}, 
      semester_id=${semester_id}, course_id=${course_id}, professor_id=${professor_id}, 
      host_field_of_study_id=${
        host_field_of_study_id !== -1 ? host_field_of_study_id : null
      }, class1_id=${class1_id}, class2_id=${
        class2_id !== -1 ? class2_id : null
      }, 
      submitter_user_id=${
        req.user.id
      }, accessibleFor_user_id=${accessibleFor_user_id}, time1_id=${time1_id}, 
      time2_id=${class2_id !== -1 ? time2_id : null} where id = ${id}`
    );

    res.status(201).json({ message: `برنامه مورد نظر با موفقیت ویرایش شد` });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "خطا در اجرای دستور در پایگاه داده" });
  } finally {
    connection.end();
  }
};

const update_schedule_state = async (req, res) => {
  const { id } = req.body;
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
      .json({ message: `وضعیت برنامه ی مورد نظر با موفقیت تغییر پیدا کرد` });
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
      `select * from schedules where id = ${id}`
    );

    if (result1.length === 0)
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
