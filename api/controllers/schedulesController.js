const mysql = require("mysql2/promise");
const dbConfig = require("../config/dbConfig");

const get_all_by_filter = async (req, res) => {
  
};

const create_schedule = async (req, res) => {};

const email_schedule = async (req, res) => {
  const professor_id = req.body.professor_id;
};

const update_schedule = async (req, res) => {};

const delete_schedule = async (req, res) => {};

module.exports = {
  get_all_by_filter,
  create_schedule,
  email_schedule,
  update_schedule,
  delete_schedule,
};
