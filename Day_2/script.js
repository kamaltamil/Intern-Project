// ================================
// Student Management System
// ================================

// Variables

let students = JSON.parse(localStorage.getItem("students")) || [];
let editId = null;
let sortAscending = true;


// DOM Elements

const studentForm = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const departmentInput = document.getElementById("department");
const studentTable = document.getElementById("studentTable");
const totalStudents = document.getElementById("totalStudents");
const averageAge = document.getElementById("averageAge");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("search");
const filterDepartment = document.getElementById("filterDepartment");
const sortBtn = document.getElementById("sortBtn");
const addBtn = document.getElementById("addBtn");

const nameError = document.getElementById("nameError");
const ageError = document.getElementById("ageError");
const departmentError = document.getElementById("departmentError");
const formError = document.getElementById("formError");



// Event Listeners

studentForm.addEventListener("submit", saveStudent);
resetBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", applyFilters);
filterDepartment.addEventListener("change", applyFilters);
sortBtn.addEventListener("click", sortStudents);
document.addEventListener("DOMContentLoaded", initializeApp);

// nameInput.addEventListener("keydown", checkEnter);
// ageInput.addEventListener("keydown", checkEnter);
// departmentInput.addEventListener("keydown", checkEnter);

nameInput.addEventListener("input", nameValidate);
ageInput.addEventListener("input", ageValidation);
departmentInput.addEventListener("change", departmentValidation);
// addBtn.addEventListener("click", formvalidation);



// function checkEnter(event){

//     if(event.key==="Enter"){

//         studentForm.requestSubmit();

//     }

// }

// -------------------------
// Reset Form
// -------------------------

function resetForm() {

    studentForm.reset();

    editId = null;

    addBtn.textContent = "Add Student";

    searchInput.value = "";

    nameError.textContent = "";

    ageError.textContent = "";

    departmentError.textContent = "";

    formError.textContent = "";

    filterDepartment.value = "All";

    displayStudents();

    updateStatistics();
}


// -------------------------
// Validate Student Data
// -------------------------

function nameValidate(){
    const namePattern = /^[A-Za-z ]+$/;
    const name = nameInput.value.trim();
    
    if (name && !namePattern.test(name)) {
        nameError.textContent = "Enter a valid name";
        nameError.style.color = "red";
    } else {
        nameError.textContent = "";
    }
}

function ageValidation(){
    const age = Number(ageInput.value);
    
    if (ageInput.value && (age < 1 || age > 100)) {
        ageError.textContent = "Age must be between 1 and 100";
        ageError.style.color = "red";
    } else {
        ageError.textContent = "";
    }
}

function departmentValidation(){
    const department = departmentInput.value;
    if (!department) {
        departmentError.textContent = "Please select a department";
        departmentError.style.color = "red";
    } else {
        departmentError.textContent = "";
    }
    
}

// function formvalidation(){

//     const name = nameInput.value.trim();
    
//     const age = Number(ageInput.value);
    
//     const department = departmentInput.value;
    
//     if (!department) {
//         departmentError.textContent = "Please select a department";
//         departmentError.style.color = "red";
//     } else {
//         departmentError.style.color = "";
//     }
    
//     if (!name || !department || !ageInput.value) {
//         formError.textContent = "Please fill all fields";
//         formError.style.color = "red";
//     } else {
//         formError.style.color = "";
//     }
// }

// -------------------------
// Save Student
// -------------------------

function saveStudent(event) {
    
    event.preventDefault();
    
    const name = nameInput.value.trim();
    
    const age = Number(ageInput.value);
    
    const department = departmentInput.value;
    
    // Validation
    
    const namePattern = /^[A-Za-z ]+$/;
    
    if (!name || !department || !ageInput.value) {
        formError.textContent = "Please fill all fields";
        formError.style.color = "red";
        return;
    }

    if (name && !namePattern.test(name)) {
        nameError.textContent = "Enter a valid name";
        nameError.style.color = "red";
        return;
    }
    
    if (ageInput.value && (age < 1 || age > 100)) {
        ageError.textContent = "Age must be between 1 and 100";
        ageError.style.color = "red";
        return;
    } 

    if (!department) {
        departmentError.textContent = "Please select a department";
        departmentError.style.color = "red";
        return;
    }
    
    
    // Duplicate Name Check

    const duplicate = students.some(student =>
        student.name.toLowerCase() === name.toLowerCase() &&
        student.id !== editId
    );

    if (duplicate) {

        alert("Student Name Already Exists");

        return;

    }

    // Edit Student

    if (editId !== null) {

        const index = students.findIndex(student => student.id === editId);

        students[index] = {

            ...students[index],

            name,

            age,

            department

        };

        editId = null;

        addBtn.textContent = "Add Student";

    }

    // Add Student

    else {

        const student = {

            id: Date.now(),

            name,

            age,

            department

        };

        students.push(student);

    }

    saveToLocalStorage();

    displayStudents();

    updateStatistics();

    studentForm.reset();

    nameError.textContent = "";

    ageError.textContent = "";

    departmentError.textContent = "";

    formError.textContent = "";

}


// -------------------------
// Display Students
// -------------------------

function displayStudents(studentList = students) {

    studentTable.innerHTML = "";

    if (studentList.length === 0) {

        studentTable.innerHTML = `
            <tr>
                <td colspan="5">
                    No Students Found
                </td>
            </tr>
        `;

        return;
    }

    studentList.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${student.id}</td>

            <td>${student.name}</td>

            <td>${student.age}</td>

            <td>${student.department}</td>

            <td>

                <button type="button" onclick="editStudent(${student.id})">
                    Edit
                </button>

                <button type="button" onclick="deleteStudent(${student.id})">
                    Delete
                </button>

            </td>

        `;

        row.addEventListener("dblclick", () => {

            showStudentDetails(student.id);

        });

        studentTable.appendChild(row);

    });

}

// -------------------------
// Edit Student
// -------------------------

function editStudent(id) {

    const student = students.find(student => student.id === id);

    if (!student) return;

    const { name, age, department } = student;

    nameInput.value = name;

    ageInput.value = age;

    departmentInput.value = department;

    editId = id;

    addBtn.textContent = "Update Student";

    nameError.textContent="";
    ageError.textContent="";
    departmentError.textContent="";
    formError.textContent="";

}

// -------------------------
// Delete Student
// -------------------------

function deleteStudent(id) {

    const confirmDelete = confirm("Are you sure?");

    if (!confirmDelete) return;

    students = students.filter(student => student.id !== id);

    studentForm.reset();
    
    editId = null;

    addBtn.textContent="Add Student";

    saveToLocalStorage();

    displayStudents();

    updateStatistics();

}

// -------------------------
// Search and Filter Student
// -------------------------

function applyFilters() {

    const keyword = searchInput.value.toLowerCase();

    const department = filterDepartment.value;

    let filteredStudents = [...students];

    if (department !== "All") {

        filteredStudents = filteredStudents.filter(student =>

            student.department === department

        );

    }

    if (keyword !== "") {

        filteredStudents = filteredStudents.filter(student =>

            student.name.toLowerCase().includes(keyword)

        );

    }

    displayStudents(filteredStudents);

}

// -------------------------
// Sort Students
// -------------------------

function sortStudents(){

    students.sort((a,b)=>{

        if(sortAscending){

            return a.name.localeCompare(b.name);

        }

        return b.name.localeCompare(a.name);

    });

    sortAscending = !sortAscending;

    sortBtn.textContent =

        sortAscending

        ? "Sort A-Z"

        : "Sort Z-A";

    applyFilters();

}

// -------------------------
// Student Details
// -------------------------

function showStudentDetails(id){

    const student = students.find(student=>student.id===id);
    console.table(student);
}

// -------------------------
// Statistics
// -------------------------

function updateStatistics(){

    totalStudents.textContent = students.length;

    if(students.length===0){

        averageAge.textContent=0;

        return;
    }

    const totalAge = students.reduce(

        (sum,student)=>sum+student.age,

        0

    );

    averageAge.textContent=(totalAge/students.length).toFixed(1);

}


// -------------------------
// Local Storage
// -------------------------

function saveToLocalStorage(){

    localStorage.setItem(

        "students",

        JSON.stringify(students)

    );

}


// -------------------------
// Initialize App
// -------------------------

function initializeApp(){

    displayStudents();

    updateStatistics();

}