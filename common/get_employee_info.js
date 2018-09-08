const getDbConnection = require('./db');

const getEmployeeInfo = (employeeId, employeeEmail, cache, baseUser) => {
  let user = baseUser;
  const conn = getDbConnection('mds');
  let employeeIdLookup = Promise.resolve(employeeId);
  if (employeeId === null) {
    // We could check that it's ashevillenc.gov first, actually.
    const query = `select emp_id from amd.ad_info where email_city = '${req.session.email}'`;
    employeeIdLookup = conn.query(query)
    .then(res => {
      if (res && res.rows && res.rows.length > 0) {
        return Promise.resolve(res.rows[0].empid);
      }
      throw new Error(`Unable to find employee record for ${req.session.email}`);
    });
  };

  return employeeIdLookup
  .then(empId => {
    const cacheKey = `employee-${empId}`;
    user = cache.get(cacheKey);
    if (user) return Promise.resolve(user);

    const query = 'select empid, active, position, employee, emp_email, supid, supervisor, '
    + 'deptid, department, divid, division, hire_date, '
    + 'sup_email from internal.employees where empid = $1';
    return conn.query(query, [empId])
    .then(data => {
      if (data.rows && data.rows.length > 0) {
        const e = data.rows[0];
        user = Object.assign({}, baseUser, {
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
        });
        cache.store(cacheKey, user);
      }
      return Promise.resolve(user);
    })
    .catch(error => {
      console.log(`Error: ${error}`);
      return Promise.resolve(user);
    });
  });
}

module.exports = getEmployeeInfo;
