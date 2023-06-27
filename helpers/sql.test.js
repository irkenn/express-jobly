const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');


describe("SQL query string and values", function(){
    let dataFields = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin"
    };

    test("Throws an error when there's no data", function (){
        const emptyObj = {};
        expect(() => {
            sqlForPartialUpdate(emptyObj, dataFields);
        }).toThrow(BadRequestError);
    });

    test("Creates a correct query string and parameters", function(){
        let newParams = {
            firstName : "Ezra",
            isAdmin: false
        }
        let result = sqlForPartialUpdate(newParams, dataFields);
        
        expect(result.setCols).toEqual('"first_name"=$1, "is_admin"=$2');
        expect(result.values).toEqual(['Ezra', false]);
    });
});

