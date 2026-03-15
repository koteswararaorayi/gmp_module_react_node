const { pool } = require("../config/database");

async function findUserByUsername(username) {
  const sql = `
    SELECT
      u.id,
      u.company_id,
      u.username,
      u.email,
      u.password,
      u.role AS role_id,
      u.user_image,
      u.is_active,
      u.current_status,
      u.from_date,
      u.to_date,
      r.role
    FROM application_users u
    LEFT JOIN roles r
      ON r.id = u.role
      AND (r.company_id = u.company_id OR r.company_id IS NULL)
    WHERE u.email = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [username]);
  return rows[0] || null;
}

async function findUserByEmail(email) {
  const sql = `
    SELECT id, company_id, username, email, password
    FROM application_users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [email]);
  return rows[0] || null;
}

async function insertLoginHistory({ companyId, userId, loginIp, loginBrowser }) {
  const sql = `
    INSERT INTO application_user_logins
      (company_id, user_id, login_from, login_ip, login_browser)
    VALUES (?, ?, NOW(), ?, ?)
  `;

  await pool.execute(sql, [companyId, userId, loginIp, loginBrowser]);
}

async function markLogoutByUserId(userId) {
  const sql = `
    UPDATE application_user_logins
    SET login_to = NOW()
    WHERE user_id = ?
      AND login_to IS NULL
  `;

  await pool.execute(sql, [userId]);
}

async function getProfileByUserId(userId, companyId) {
  const sql = `
    SELECT
      u.id AS user_id,
      u.username,
      u.email,
      u.company_id,
      u.user_image,
      u.from_date,
      u.to_date,
      u.is_active,
      u.current_status,
      u.role AS role_id,
      r.role
    FROM application_users u
    LEFT JOIN roles r
      ON r.id = u.role
      AND (r.company_id = u.company_id OR r.company_id IS NULL)
    WHERE u.id = ?
      AND u.company_id = ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [userId, companyId]);
  return rows[0] || null;
}

async function updateProfileByUserId(userId, companyId, payload) {
  const sql = `
    UPDATE application_users
    SET username = ?, email = ?, user_image = ?, updated_date = NOW(), updated_by = ?
    WHERE id = ? AND company_id = ?
  `;

  const [result] = await pool.execute(sql, [
    payload.userName,
    payload.email,
    payload.userImage,
    userId,
    userId,
    companyId,
  ]);

  return result.affectedRows;
}

async function emailExistsForOtherUser(email, userId) {
  const sql = `
    SELECT id
    FROM application_users
    WHERE email = ?
      AND id <> ?
    LIMIT 1
  `;

  const [rows] = await pool.execute(sql, [email, userId]);
  return rows.length > 0;
}

async function updateUserPassword(userId, hashedPassword) {
  const sql = `
    UPDATE application_users
    SET password = ?, password_reset_date = CURDATE(), updated_date = NOW(), updated_by = ?
    WHERE id = ?
  `;

  const [result] = await pool.execute(sql, [hashedPassword, userId, userId]);
  return result.affectedRows;
}

async function getRoles() {
  const sql = `
    SELECT id, role, role_short_code, company_id
    FROM roles
    WHERE is_active = 0
    ORDER BY id ASC
  `;

  const [rows] = await pool.execute(sql);
  return rows;
}

async function getLoginHistoryByUserId(userId, limit, offset) {
  const listSql = `
    SELECT
      id,
      login_from AS login_date,
      login_to AS logout_date,
      login_ip AS ip_address,
      TIMESTAMPDIFF(MINUTE, login_from, COALESCE(login_to, NOW())) AS duration_minutes
    FROM application_user_logins
    WHERE user_id = ?
    ORDER BY login_from DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM application_user_logins
    WHERE user_id = ?
  `;

  const [[countRows], [rows]] = await Promise.all([
    pool.execute(countSql, [userId]),
    pool.execute(listSql, [userId, limit, offset]),
  ]);

  const countRow = countRows[0] || { total: 0 };

  return {
    total: Number(countRow.total || 0),
    rows,
  };
}

async function getManagersByCompany(companyId) {
  const sql = `
    SELECT
      u.id,
      u.username,
      u.email,
      r.role
    FROM application_users u
    LEFT JOIN roles r
      ON r.id = u.role
      AND (r.company_id = u.company_id OR r.company_id IS NULL)
    WHERE u.company_id = ?
      AND u.is_active = 0
      AND (LOWER(COALESCE(r.role, '')) IN ('admin', 'manager'))
    ORDER BY u.username ASC
  `;

  const [rows] = await pool.execute(sql, [companyId]);
  return rows;
}

module.exports = {
  findUserByUsername,
  findUserByEmail,
  insertLoginHistory,
  markLogoutByUserId,
  getProfileByUserId,
  updateProfileByUserId,
  emailExistsForOtherUser,
  updateUserPassword,
  getRoles,
  getLoginHistoryByUserId,
  getManagersByCompany,
};
