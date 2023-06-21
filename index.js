// Import and require mysql2 for mysql connection
const mysql = require("mysql2");
const inquirer = require("inquirer");

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "ce$#630o485lo59#",
    //
    database: "employeeTracker",
  },
  console.log(`Connected to the employeeTracker database.`)
);

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
  {
    type: "choice",
    name: "nameRolDepartment",
    message: "What is the department for this role?",
    when: (answers) => answers.menu === "add an role",
  },

  {
    type: "input",
    name: "nameEmpfirstname",
    message: "What is the first name of the employee",
    when: (answers) => answers.menu === "add an employee",
  },
  {
    type: "input",
    name: "nameEmplastname",
    message: "What is the last name of the employee",
    when: (answers) => answers.menu === "add an employee",
  },
  // {
  //   type: "list",
  //   name: "nameEmprole",
  //   message: "What is the employees role?",
  //   // choices:[{name:'Sales Lead',value:1},{name:'Salesperson', value:2},{name:'Lead Engineer', value:3},{name:'Software Engineer', value:4},{name:'Account Manager', value:5},{name:'Accountant', value:6},{name:'Legal Team Lead', value:7}, {name:'Lawyer', value:8}],
  //   when: (answers) => answers.menu === "add an employee",
  // },
  {
    type: "choice",
    name: "nameEmpmanager",
    message: "What is the name of this employees manager",
    // choices:[{name:'John Doe',value:1},{name:'Ashley Rodriguez',value:3},{name:'Kunal Singh',value:5},{name:'Sarah Lourd',value:7},],
    choices:()=>{
      db.query("SELECT id,title FROM role", function (err, results) {
        if (err) {  
          console.error(err);
        } else {
          console.table(results);
          const choices = results.map((result) => ({
            name: result.title,
            value: result.id,
          }));
          console.log(choices);
          return choices;
        }
      })
    },
    when: (answers) => answers.menu === "add an employee",
  },

  {
    //select specific employee depending on user and then once employee selected insert new role replace
    //selection from roles turns to list option for inquirer or input write employee name
    //gets from table name match and updates the role
    type: "input",
    name: "nameofemployee",
    message: "What is the name of the employee you want to update?",
    when: (answers) => answers.menu === "update an employee role",
  },
  {
    type: "input",
    name: "nameofRoleupdate",
    message: "What is the new role for this employee?",
    when: (answers) => answers.menu === "update an employee role ",
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
        getRoleForAddEmployee(answers);
        //  db.query('INSERT INTO employee (first_name,last_name) VALUES (?,?)',[answers.nameEmpfirstname,answers.nameEmplastname]);
        break;
      case "update an employee role":
      getDepartmentforupdateEmployee(answers);
      break;
    }
  });
};


function viewAllEmployees() {
  db.query("SELECT * FROM employee", function (error, results) {
    if (error) {
      console.error(error);
    } else {
      console.table(results);
    
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
            console.log("Selected employee:", selectedEmployee);
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

function getRoleForAddEmployee() {
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
          console.log("Selected Role:", selectedrole);
          updateEmployeeQuestions(selectedrole);
        });
    }
  });
}
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
          console.log("Selected Role:", selectedrole);
          updateEmployeeRole(employeeid, selectedrole);
        });
    }
  });
}

function viewAllRoles() {
  db.query("SELECT * FROM role", function (error, results) {
    if (error) {
      console.error(error);
    } else {
      console.table(results);
      getRole(results);
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
          addRoleQuestions(answer.selectDep);
        
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
  db.query("INSERT INTO department (name) VALUES (?)", [answers.nameDep]),
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        tablemainMenu();
      }
    };
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

function updateEmployeeQuestions(departmentId){
  const updateEmp = [
    {
      type:"input",
      name:"firstnameEmp",
      message:"What is the first name?",
    },
    {
      type:"input",
      name:"lastnameEmp",
      message:"What is the last name?",
    }
  ];
  inquirer.prompt(updateEmp).then((answers)=>{
    addEmployee(answers,departmentId)
  })
}
function addEmployee(answers,departmentId) {
  //join role id to employee id get corresponding job title based on id
  //user picks sales associate, value of 1 id, returns int 1 as result
  //return name of employee that manager id and employee id match
  db.query(
    "INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)",
    [
      answers.firstnameEmp,
      answers.lastnameEmp,
      //role id 
      departmentId,
      // answers.nameEmpmanager,
    ]
  ),
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        tablemainMenu();
      }
    };
}
function updateEmployeeRole(employeeId, roleId) {
  //update employee number id role
  db.query("UPDATE employee SET role_id = (?) WHERE (id = (?))", [
    roleId,
    employeeId,
  ]),
    function (error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log(results);
        // tablemainMenu();
      }
    };
}
function addRole(answers,idvalue) {
  db.query("INSERT INTO role (title,salary,department_id) VALUES (?,?,?)", [
    answers.nameRol,
    answers.nameRolsalary,
    idvalue,
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

// function returnManagerRole(){
//   // make call on employee table return role id if the 
//   // slect role if manager id is null
// }
tablemainMenu();
//role department
//function gets department table and displays it as array result starting at 1 or get the id of each one stored as its value

//employee data role and manager
//function that gets table employee and gets the manager-id null first name and last name into array for user to select from
//function get title from role and get back the id of that role return id of role which will be used as data for
