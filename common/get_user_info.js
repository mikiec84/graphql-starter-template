const getDbConnection = require('./db');

const getNonCityUser = (isLoggedIn, req, cache) => {
  let user = {
    id: null,
    name: null,
    email: null,
    position: null,
    department: null,
    division: null,
    supervisor_id: null,
    supervisor: null,
    supervisor_email: null,
  };
  if (isLoggedIn) {
    const cacheData = cache.get(req.session.id);
    user.email = req.session.email;
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

        query = 'select empid, active, position, employee, emp_email, supid, supervisor, '
        + 'deptid, department, divid, division, hire_date, '
        + 'sup_email from internal.employees where empid = $1';
        return conn.query(query, [res.rows[0].emp_id])
        .then(data => {
          if (data.rows && data.rows.length > 0) {
            const e = data.rows[0];
            user = {
              id: e.empid,
              active: e.active,
              name: e.employee,
              email: e.emp_email,
              position: e.position,
              department_id: e.deptid,
              department: e.department,
              division_id: e.divid,
              division: e.division,
              supervisor_id: e.supid,
              supervisor_name: e.supervisor,
              supervisor_email: e.sup_email,
              hire_date: e.hire_date,
            };
            cache.store(req.session.id, Object.assign({}, cacheData, { user }));
          }
          return Promise.resolve(user);
        })
        .catch(error => {
          console.log(`Error: ${error}`);
          return Promise.resolve(user);
        });
      });
    }
  }
  return getNonCityUser(isLoggedIn, req, cache);
}

module.exports = getUserInfo;
