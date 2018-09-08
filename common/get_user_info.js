const getDbConnection = require('./db');
const getEmployeeInfo = require('./get_employee_info');

const baseUser = {
  id: null,
  active: null,
  name: null,
  email: null,
  position: null,
  department_id: null,
  department: null,
  division_id: null,
  division: null,
  supervisor_id: null,
  supervisor_name: null,
  supervisor_email: null,
  hire_date: null,
}

const getNonCityUser = (isLoggedIn, req, cache) => {
  let user = baseUser;
  if (isLoggedIn) {
    const cacheData = cache.get(req.session.id);
    user = Object.assign({}, baseUser, { email: req.session.email });
    // user.email = req.session.email;
    cache.store(req.session.id, Object.assign({}, cacheData, { user }));
  }
  return Promise.resolve(user);
};

const getUserInfo = (isLoggedIn, enableEmployeeLogins, req, cache) => {
  const isGoogle = (req.session.loginProvider === 'Google');
  if (isLoggedIn && enableEmployeeLogins && isGoogle) {
    let user = {};
    const cacheData = cache.get(req.session.id);
    if (cacheData !== undefined && cacheData.user !== undefined) {
      user = cacheData.user;
    }
    if (user.id === undefined) {
      const conn = getDbConnection('mds');
      let query = `select emp_id from amd.ad_info where email_city = '${req.session.email}'`;
      return conn.query(query)
      .then(res => {
        // We could check that it's ashevillenc.gov first, actually.
        if (res.rows.length === 0) return getNonCityUser(isLoggedIn, req, cache);
        return getEmployeeInfo(res.rows[0].emp_id, req.session.email, cache, baseUser)
        .then(u => {
          cache.store(req.session.id, Object.assign({}, cacheData, { user: u }));
          return Promise.resolve(u);
        });
      });
    }
    return Promise.resolve(user);
  }
  return getNonCityUser(isLoggedIn, req, cache);
}

module.exports = getUserInfo;
