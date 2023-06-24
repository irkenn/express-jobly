const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //dataToUpdate: contains only the fields and the data that will be updated
  //jsToSql: contains all the columns that the table has. 
  
  // Retrieve all the keys from the passed object
  const keys = Object.keys(dataToUpdate);
  //Throw an error if there are no keys
  if (keys.length === 0) throw new BadRequestError("No data");

  // Will convert a dictionary in an array for a SQL request 
  //{firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function sqlForFilteredFinds(queryParams){
  
  
  //This is going to throw the error is min is greater than max
  
  let { name, minEmployees, maxEmployees } = queryParams;
  let conditions = {};
  if(name){
    name = `%${name}%`;
    conditions[name] = `name ilike`;
  } 
  if(minEmployees && maxEmployees){
    if(minEmployees > maxEmployees) throw new BadRequestError("Invalid: min employees number is greater than max number");
  }
  if(minEmployees) {
    minEmployees = Number(minEmployees);
    conditions[minEmployees] = `num_employees >=`
  }
  if(maxEmployees) {
    maxEmployees = Number(maxEmployees);
    conditions[maxEmployees] = `num_employees <=`
  }
  // if(minEmployees) conditions.minEmployees = `num_employees >= ${minEmployees}`;
  // if(maxEmployees) conditions.maxEmployees = `num_employees <= ${maxEmployees}`;
  let values = Object.values(conditions);
  let cols = values.map((colName, idx) => `${conditions[colName] || colName} $${idx +1}`);
  
  
  return {
    setCols: cols.join(" AND "),
    values : Object.keys(conditions)
  };

  



};

module.exports = { sqlForPartialUpdate, sqlForFilteredFinds };
