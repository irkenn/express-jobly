"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function (){
    const jobData = {
        title: "job4",
        salary: 2,
        equity: "1",
        companyHandle: "c1"
    };

    test("creates new job", async function () {
        let newJob = await Job.create(jobData);
        expect(newJob).toEqual(
            {
                id: expect.any(Number),
                title: "job4",
                salary: 2,
                equity: "1",
                companyHandle: "c1"
            }
        );

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE company_handle = 'c1'`);
        expect(result.rows).toEqual([
            {
                id: expect.any(Number),
                title: "job1",
                salary: 100,
                equity: "1",
                companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "job4",
                salary: 2,
                equity: "1",
                companyHandle: "c1"
            }
        ]);
    });

    test("fails if the company does not exist", async function(){
        try{
            let failJob = await Job.create({
                title: "job4",
                salary: 2,
                equity: "1",
                companyHandle: "Not-a-valid-Company"
            });
            fail();
        } catch(err){
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** filteredFind */

describe("filtered find", function (){
    const filterParams1 = {
        title: "job2",
        salary: 150,
        equity: true
     };
    const params = {
        title : "title",
        salary: "salary",
        equity: "equity"
    };

    test("retrieves according to the criteria", async function (){
        let result = await Job.filteredFind(
            filterParams1, 
            params);
        expect(result).toEqual(
            [{
                id: expect.any(Number),
                title: "job2",
                salary: 200,
                equity: "1",
                companyHandle: "c2"
            }]);
    });

});



/************************************** findAll */

describe("find all jobs", function (){
    test("retrieves all the jobs from the database", async function (){
        let jobs = await Job.findAll();
        expect(jobs).toEqual(
            [
                {
                  id: expect.any(Number),
                  title: 'job1',
                  salary: 100,
                  equity: '1',
                  companyHandle: 'c1'
                },
                {
                  id: expect.any(Number),
                  title: 'job2',
                  salary: 200,
                  equity: '1',
                  companyHandle: 'c2'
                },
                {
                  id: expect.any(Number),
                  title: 'job3',
                  salary: 300,
                  equity: '1',
                  companyHandle: 'c3'
                }
              ]
        )
    });
});