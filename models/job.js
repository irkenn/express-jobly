const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteredJobFinds } = require("../helpers/sql");

class Job{

    static async create({ title, salary, equity, companyHandle }){
        const checkIfCompanyExists = await db.query(
            `SELECT handle
                FROM companies
                WHERE handle = $1`,
            [companyHandle]);
        
        if(!checkIfCompanyExists.rows[0]){
            throw new BadRequestError(`Company ${companyHandle} does not exist`);
        }

        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"
            `,
            [title, 
            salary, 
            equity, 
            companyHandle]);

        const job = result.rows[0];
        return job;
    }

    static async findAll(){
        const jobsRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                FROM jobs
                ORDER BY id`);
        return jobsRes.rows;
    }

    static async queryJob(id){
        let result = await db.query(`
            SELECT equity, salary 
                FROM jobs
                WHERE id=$1
        `, [id]);
        return typeof(result.rows[0].equity);
    }

    static async filteredFind(requestQuery){
        //sqlForFilteredJobFinds will generate an appropiate query string and also pass the values
        const { setCols, values } = sqlForFilteredJobFinds(requestQuery);
        const result = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
                FROM jobs
                WHERE ${setCols}`,
            values);
        //If there's no match it will throw an error
        if(!result || result.rows.length === 0) throw new NotFoundError(`No current matches for your request`);

        return result.rows;
    }
}

module.exports = Job;