// Import and require mysql2 for mysql connection
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("dotenv").config();

// Connect to database
const db = mysql.createConnection(
  {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  console.log(`Connected to the employeeTracker database.`)
);



//verification for type of integer inquirer
const promptQuestions = [
  {
    type: "list",
    name: "menu",
    message: "Welcome to Employee Tracker select what you want to view",
    choices: [
      "View all Employees",
      "view all roles",
      "view all departments",
      "add a department",
      "add a role",
      "add an employee",
      "update an employee role",
      "[Exit]",
    ],
  },
  {
    type: "input",
    name: "nameDep",
    message: "What is the name of the department you wish to add",
    when: (answers) => answers.menu === "add a department",
  },

  {
    type: "input",
    name: "nameRol",
    message: "What is the name of the role you want to add",
    when: (answers) => answers.menu === "add an role",
  },
  {
    type: "input",
    name: "nameRolsalary",
    message: "What is the salary for this role?",
    when: (answers) => answers.menu === "add an role",
  },
  //make change for choices dispay the departments in a list for user to select.
  {
    type: "list",
    name: "nameRolDepartment",
    message: "What is the department for this role?",
    when: (answers) => answers.menu === "add an role",
  },
];
//create variable with the value of an array of objects
//add the constructor
function tablemainMenu() {
  inquirer.prompt(promptQuestions).then((answers) => {
    switch (answers.menu) {
      case "View all Employees":
        viewAllEmployees(answers);
        break;
      case "view all roles":
        viewAllRoles(answers);
        break;
      case "view all departments":
        viewAllDepartments(answers);
        break;
      case "add a department":
        addDepartment(answers);
        break;
      case "add a role":
        getDepartments(answers);
        // addRole(answers);
        break;
      case "add an employee":
        inquirer
          .prompt([
            {
              type: "input",
              name: "nameEmpfirstname",
              message: "What is the first name of the employee",
            },
            {
              type: "input",
              name: "nameEmplastname",
              message: "What is the last name of the employee",
            },
            {
              type: "list",
              name: "role",
              message: "What is the role of this employee?",
              choices: function () {
                return db
                  .promise()
                  .query("SELECT * FROM role")
                  .then(([rows]) => {
                    return rows.map((row) => {
                      return {
                        name: row.title,
                        value: row.id,
                      };
                    });
                  })
                  .catch((err) => {
                    throw err;
                  });
              },
            },
            {
              type: "list",
              name: "nameEmpmanager",
              message: "What is the name of this employees manager",
              choices: function () {
                return db
                  .promise()
                  .query("SELECT * FROM employee")
                  .then(([rows]) => {
                    return rows.map((row) => {
                      return {
                        name: `${row.first_name} ${row.last_name}`,
                        value: row.id,
                      };
                    });
                  })
                  .catch((err) => {
                    throw err;
                  });
              },
            },
          ])
          .then((employeeAnswers) => {
            // Call the addEmployee function with the answers
            addEmployee({ ...answers, ...employeeAnswers });
          });
        break;
      // Other cases...
      case "update an employee role":
        getEmployees(answers);
        break;
      case "[Exit]":
        process.exit(0);
    }
  });
}

function viewAllEmployees() {
  db.query("SELECT * FROM employee", function (error, results) {
    if (error) {
      console.error(error);
    } else {
      console.table(results);
      tablemainMenu();
    }
  });
}

//get firstname and lastname along with the value id
function getEmployees(answers) {
  db.query(
    "SELECT id, first_name, last_name FROM employee",
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.table(results);
        const choices = results.map((result) => ({
          name: `${result.first_name} ${result.last_name}`,
          value: result.id, // You can use the entire result object as the value if needed
        }));
        //console.log(choices);
        inquirer
          .prompt({
            type: "list",
            name: "selectedEmployee",
            message: "Select an employee:",
            choices: choices,
          })
          .then((answer) => {
            const selectedEmployee = answer.selectedEmployee;
            getRole(selectedEmployee);
            // You can perform further operations with the selected employee here
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  );
}

// function getRoleForAddEmployee() {
//   //need to get the id with the role
//   db.query("SELECT id,title FROM role", function (err, results) {
//     if (err) {
//       console.error(err);
//     } else {
//       console.table(results);
//       const choices = results.map((result) => ({
//         name: `${result.title}`,
//         value: result.id,
//       }));
//       inquirer
//         .prompt({
//           type: "list",
//           name: "selectedRole",
//           message: "Select an Role:",
//           choices: choices,
//         })
//         .then((answer) => {
//           const selectedrole = answer.selectedRole;
//           console.log("Selected Role:", selectedrole);
//           updateEmployeeQuestions(selectedrole);
//         });
//     }
//   });
// }
function getRole(employeeid) {
  //need to get the id with the role
  db.query("SELECT id,title FROM role", function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.table(results);
      const choices = results.map((result) => ({
        name: `${result.title}`,
        value: result.id,
      }));
      inquirer
        .prompt({
          type: "list",
          name: "selectedRole",
          message: "Select an Role:",
          choices: choices,
        })
        .then((answer) => {
          const selectedrole = answer.selectedRole;
          getManager(employeeid, selectedrole);

          // updateEmployeeRole(employeeid, selectedrole);
        });
    }
  });
}

function getManager(employeeid, selectedrole) {
  {
    db.query("SELECT * FROM employee", function (err, results) {
      if (err) {
        console.error(err);
      } else {
        console.table(results);
        const choices = results.map((result) => ({
          name: `${result.first_name} ${result.last_name}`,
          value: result.id,
        }));
        inquirer
          .prompt({
            type: "list",
            name: "selectedManager",
            message: "Select Manager:",
            choices: choices,
          })
          .then((answer) => {
            const selectedmanager = answer.selectedManager;
            updateEmployeeRole(employeeid, selectedrole, selectedmanager);

            // updateEmployeeRole(employeeid, selectedrole);
          });
      }
    });
  }
}
function viewAllRoles() {
  db.query("SELECT * FROM role", function (error, results) {
    if (error) {
      console.error(error);
    } else {
      console.table(results);
      // getRole(results);
      tablemainMenu();
    }
  });
}

function getDepartments(answers) {
  //need to get the id with the role
  db.query("SELECT id, name FROM department", function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.table(results);
      const choices = results.map((result) => ({
        name: `${result.name}`,
        //if value null the it is a manager

        value: result.id,
      }));
      inquirer
        .prompt({
          type: "list",
          name: "selectDep",
          message: "Select an Department:",
          choices: choices,
        })
        .then((answer) => {
          const selectdep = answer.selectDep;
          console.log("Selected Department:", selectdep);
          // updateEmployeeRole(employeeid,selectedrole);
          // addRole(answers, selectdep)
          addRoleQuestions(answer.selectdep);
        });
    }
  });
}

function getDepartmentforupdateEmployee(answers) {
  //need to get the id with the role
  db.query("SELECT id, name FROM department", function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.table(results);
      const choices = results.map((result) => ({
        name: `${result.name}`,
        //if value null the it is a manager

        value: result.id,
      }));
      inquirer
        .prompt({
          type: "list",
          name: "selectDep",
          message: "Select an Department:",
          choices: choices,
        })
        .then((answer) => {
          const selectdep = answer.selectDep;
          console.log("Selected Department:", selectdep);
          // updateEmployeeRole(employeeid,selectedrole);
          // addRole(answers, selectdep)
          updateEmployeeQuestions(answers.selectDep);
        });
    }
  });
}

// function addDepartment(answers, idvalue){
// //make update to the table role
// }
function viewAllDepartments() {
  db.query("SELECT * FROM department;", function (error, results) {
    if (error) {
      console.error(error);
    } else {
      console.table(results);
      tablemainMenu();
    }
  });
}

function addDepartment(answers) {
  db.query(
    "INSERT INTO department (name) VALUES (?)",
    [answers.nameDep],
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        tablemainMenu();
      }
    }
  );
}
function addRoleQuestions(departmentId) {
  const roleQuestions = [
    {
      type: "input",
      name: "nameRol",
      message: "What is the name of the role you want to add",
    },
    {
      type: "input",
      name: "nameRolsalary",
      message: "What is the salary for this role?",
    },
  ];

  inquirer.prompt(roleQuestions).then((answers) => {
    addRole(answers, departmentId);
  });
}

// function updateEmployeeQuestions(departmentId){
//   const updateEmp = [
//     {
//       type:"input",
//       name:"firstnameEmp",
//       message:"What is the first name?",
//     },
//     {
//       type:"input",
//       name:"lastnameEmp",
//       message:"What is the last name?",
//     }
//   ];
//   inquirer.prompt(updateEmp).then((answers)=>{
//     addEmployee(answers,departmentId)
//   })
// }
function addEmployee(answers) {
  db.query(
    "INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)",
    [
      answers.nameEmpfirstname,
      answers.nameEmplastname,
      //role id
      answers.role,
      answers.nameEmpmanager,
    ],
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        tablemainMenu();
      }
    }
  );
}
function updateEmployeeRole(employeeId, roleId, managerId) {
  //update employee number id role
  db.query(
    "UPDATE employee SET role_id = (?),manager_id = (?) WHERE (id = (?))",
    [roleId, managerId, employeeId],
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        tablemainMenu();
      }
    }
  );
}
function addRole(answers, idvalue) {
  db.query(
    "INSERT INTO role (title,salary,department_id) VALUES (?,?,?)",
    [answers.nameRol, answers.nameRolsalary, idvalue],
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        tablemainMenu();
      }
    }
  );
}

tablemainMenu();
