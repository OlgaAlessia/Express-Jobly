const { BadRequestError } = require("../expressError");


/** Parsel from JSON to SQL values
 * 
 * This function gets the names of the column and their index  ex. {firstName: 'Aliya', age: 32}
 * jsToSql { numEmployees: "num_employees", logoUrl: "logo_url" } because in the entry JSON the name are different
 * 
 * Returns {
 *            setCols: a string of chain column's name and index,  ex. '"first_name"=$1, "age"=$2'
 *            values: an Array of all the value in the dict dataToUpdate ex. ['Aliya', 32]
 *          }
 * 
 * Throws BadRequestError if no key is fount.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);
  
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}



/** This function create the selecClause and WHERE Clause 
 * 
 * if all the filter are pass: WHERE nameLike ILIKE ('%' || $1 || '%') AND minEmployees >= num_employees AND num_employees <= maxEmployees
 * 
 * Returns {
 *            whereClause: a string of chain column's name and index,  ex. 'num_employees >= $1 AND num_employees <= $2'
 *            values: an Array of all the value in the dict dataToUpdate ex. ['minEmployees', 32]
 *          }
 * In case no filter are given returns a empty string for whereClause, and empty array for values 
 * 
 * Throws BadRequestError if minEmployees is greater maxEmployees.
 */
function sqlForSearch(dataToFilter) {
  const whereClause = '';
  if (dataToFilter.hasOwnProperty('minEmployees') || dataToFilter.hasOwnProperty('maxEmployees')) {
    if (dataToFilter['minEmployees'] > dataToFilter['maxEmployees']) {
      throw new BadRequestError("minEmployees is greater than  maxEmployees");
    }
  }

  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) return { whereClause, values: [] }

  const clauses = keys.map((key, idx) => {
    if (key == 'nameLike') {
      return `name ILIKE '%' || $${idx + 1} || '%'`;
    }
    else if (key == 'minEmployees') {
      return `num_employees >= $${idx + 1}`;
    }
    else {  //maxEmployees
      return `num_employees <= $${idx + 1}`;
    }
  });
  return {
    whereClause: "WHERE " + clauses.join(" AND "),
    values: Object.values(dataToFilter),
  };
}



module.exports = { sqlForPartialUpdate, sqlForSearch };
