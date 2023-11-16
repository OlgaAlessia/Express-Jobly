"use strict";

const db = require("../db.js");
const { NotFoundError, BadRequestError } = require("../expressError.js");
const Job = require("./job.js");
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll, testJobIds } = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "JobTest",
    salary: 40000,
    equity: "0.1",
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let companies = await Job.findAll({})
    expect(companies).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 1000,
        equity: "0",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 2000,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1"
      },
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 3000,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3"
      },
    ]);
  });

  test("works w/filter minSalary", async function () {
    let jobs = await Job.findAll({ minSalary: 2900 });
    expect(jobs).toEqual([
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 3000,
        equity: "0",
        companyHandle: "c3",
        companyName: "C3"
      },
    ]);
  });

  test("works w/filter hasEquity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 2000,
        equity: "0.2",
        companyHandle: "c1",
        companyName: "C1"
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "Job1",
      salary: 1000,
      equity: "0",
      companyHandle: "c1",
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      }
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "UpdateJob",
    salary: 4000,
    equity: "0.14",
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      ...updateData,
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query('SELECT id FROM jobs WHERE id=$1', [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
