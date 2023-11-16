"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll,
  testJobIds, u1Token, uAdminToken } = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {

  test("works", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "newJ",
        salary: 65000,
        equity: 0.2,
        companyHandle: "c1"
      })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "newJ",
        salary: 65000,
        equity: "0.2",
        companyHandle: "c1"
      }
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 65000,
        equity: "0.012",
      })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "newJ",
        salary: 65000,
        equity: 0.2,
        companyHandle: 0,
      })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with not admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "newJ",
        salary: 65000,
        equity: 0.2,
        companyHandle: "c1"
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon, no filters", async function () {
    const resp = await request(app).get("/jobs").send({});
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 192000,
          equity: "0",
          companyHandle: "c1",
          companyName: "C1"
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 200000,
          equity: "0.4",
          companyHandle: "c1",
          companyName: "C1"
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 84000,
          equity: "0",
          companyHandle: "c3",
          companyName: "C3"
        }
      ],
    });
  });

  test("ok for anon with title, minSalary and hasEquity = false filter", async function () {
    const resp = await request(app).get("/jobs")
      .send({ title: "j", minSalary: 100000 });
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "j1",
            salary: 192000,
            equity: "0",
            companyHandle: "c1",
            companyName: "C1"
          },
          {
            id: expect.any(Number),
            title: "j2",
            salary: 200000,
            equity: "0.4",
            companyHandle: "c1",
            companyName: "C1"
          }
        ]
    });
  });

  test("ok for anon, hasEquity = true filter", async function () {
    const resp = await request(app).get("/jobs").send({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs:
        [
          {
            id: expect.any(Number),
            title: "j2",
            salary: 200000,
            equity: "0.4",
            companyHandle: "c1",
            companyName: "C1"
          }
        ]
    });
  });

  test("bad request on invalid filter", async function () {
    const resp = await request(app).get("/jobs")
      .send({ hasEquity: false, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "j1",
        salary: 192000,
        equity: "0",
        companyHandle: "c1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        }
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get("/jobs/0");
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({ equity: 0.3, salary: 185000 })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "j1",
        salary: 185000,
        equity: "0.3",
        companyHandle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({ equity: "0.3" });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({ salary: 190000 })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(404); //NotFoundError
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({ handle: "c5" })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({ salary: "190000" })
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("works for not admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${testJobIds[0]}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${uAdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
