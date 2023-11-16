const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate, sqlForSearch, sqlForSearchJobs } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: example w/companies", function () {
    const { setCols, values } = sqlForPartialUpdate({
      name: "NewOlga",
      description: "DescNewOlga",
      numEmployees: 40
    }, {
      numEmployees: "num_employees",
      logoUrl: "logo_url"
    });
    expect(setCols).toEqual('"name"=$1, "description"=$2, "num_employees"=$3');
    expect(values).toEqual(["NewOlga", "DescNewOlga", 40]);
  });

  test("BadRequestError: example w/companies", function () {
    try {
      const { setCols, values } = sqlForPartialUpdate({}, {
        numEmployees: "num_employees",
        logoUrl: "logo_url"
      });
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });


  test("works: example w/users", function () {
    const { setCols, values } = sqlForPartialUpdate({
      firstName: "Banana",
      email: "banana@aol.com"
    }, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin"
    });
    expect(setCols).toEqual('"first_name"=$1, "email"=$2');
    expect(values).toEqual(["Banana", "banana@aol.com"]);
  });

  test("BadRequestError: example w/users", function () {
    try {
      const { setCols, values } = sqlForPartialUpdate({}, {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin"
      });
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


describe("sqlForSearch", function () {
  test("filter with name, minEmployees and maxEmployees", function () {
    const { whereClause, values } = sqlForSearch({
      nameLike: "NewOlga",
      minEmployees: 5,
      maxEmployees: 40
    });
    expect(whereClause).toEqual("WHERE name ILIKE '%' || $1 || '%' AND num_employees >= $2 AND num_employees <= $3");
    expect(values).toEqual(["NewOlga", 5, 40]);
  });

  test("filter with name", function () {
    const { whereClause, values } = sqlForSearch({
      nameLike: "NewOlga"
    });
    expect(whereClause).toEqual("WHERE name ILIKE '%' || $1 || '%'");
    expect(values).toEqual(["NewOlga"]);
  });

  test("filter with minEmployees", function () {
    const { whereClause, values } = sqlForSearch({
      minEmployees: 5
    });
    expect(whereClause).toEqual("WHERE num_employees >= $1");
    expect(values).toEqual([5]);
  });

  test("filter with maxEmployees", function () {
    const { whereClause, values } = sqlForSearch({
      maxEmployees: 40
    });
    expect(whereClause).toEqual("WHERE num_employees <= $1");
    expect(values).toEqual([40]);
  });

  test("filter with nothing", function () {
    const { whereClause, values } = sqlForSearch({ });
    expect(whereClause).toEqual("");
    expect(values).toEqual([]);
  });
});