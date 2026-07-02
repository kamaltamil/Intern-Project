const hamburger = document.querySelector(".humberger");
const navContent = document.querySelector(".nav-content");

hamburger.addEventListener("click", () => {
    navContent.classList.toggle("active");
});

const signup = document.getElementById("signup");
const signupform = document.querySelector(".singup-form");
const closeBtn = document.querySelector(".close-btn");

function openSignup(){
    signupform.classList.add("active");
    document.body.classList.add("modal-open","no-scroll");
}

function closeSignup(){
    signupform.classList.remove("active");
    document.body.classList.remove("modal-open","no-scroll");
}

signup.addEventListener("click", openSignup);

closeBtn.addEventListener("click", closeSignup);

signupform.addEventListener("click",(event)=>{
    if(event.target===signupform){
        closeSignup();
    }
});

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", submitForm);

function submitForm(event){

    event.preventDefault();

    alert("✅ Message Sent Successfully!");

    contactForm.reset();

    signupform.classList.remove("active");

}

document.addEventListener("keydown",(event)=>{

    if(event.key==="Escape"){

        closeSignup();

    }

});

const firstName=document.getElementById("firstName");
const lastName=document.getElementById("lastName");
const email=document.getElementById("email");
const message=document.getElementById("message");
const terms=document.getElementById("terms");

const firstNameError=document.getElementById("firstNameError");
const lastNameError=document.getElementById("lastNameError");
const emailError=document.getElementById("emailError");
const messageError=document.getElementById("messageError");
const queryError=document.getElementById("queryError");
const termsError=document.getElementById("termsError");

firstName.addEventListener("input",validateFirstName);

function validateFirstName(){

    const pattern=/^[A-Za-z ]+$/;

    if(firstName.value.trim()===""){

        firstNameError.textContent="First Name is required";

        return false;

    }

    if(!pattern.test(firstName.value.trim())){

        firstNameError.textContent="Only letters are allowed";

        return false;

    }

    firstNameError.textContent="";

    return true;

}

lastName.addEventListener("input",validateLastName);

function validateLastName(){

    const pattern=/^[A-Za-z ]+$/;

    if(lastName.value.trim()===""){

        lastNameError.textContent="Last Name is required";

        return false;

    }

    if(!pattern.test(lastName.value.trim())){

        lastNameError.textContent="Only letters are allowed";

        return false;

    }

    lastNameError.textContent="";

    return true;

}

email.addEventListener("input",validateEmail);

function validateEmail(){

    const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email.value.trim()===""){

        emailError.textContent="Email is required";

        return false;

    }

    if(!emailPattern.test(email.value.trim())){

        emailError.textContent="Invalid Email";

        return false;

    }

    emailError.textContent="";

    return true;

}

message.addEventListener("input",validateMessage);

function validateMessage(){

    if(message.value.trim()===""){

        messageError.textContent="Message is required";

        return false;

    }

    if(message.value.trim().length<10){

        messageError.textContent="Minimum 10 characters";

        return false;

    }

    messageError.textContent="";

    return true;

}

const queryButtons=document.querySelectorAll("input[name='query']");

queryButtons.forEach(button=>{

    button.addEventListener("change",validateQuery);

});

function validateQuery(){

    const selected=document.querySelector("input[name='query']:checked");

    if(!selected){

        queryError.textContent="Select one option";

        return false;

    }

    queryError.textContent="";

    return true;

}

terms.addEventListener("change",validateTerms);

function validateTerms(){

    if(!terms.checked){

        termsError.textContent="You must accept";

        return false;

    }

    termsError.textContent="";

    return true;

}

contactForm.addEventListener("submit",submitForm);

function submitForm(event){

    event.preventDefault();

    const valid=

        validateFirstName() &&

        validateLastName() &&

        validateEmail() &&

        validateQuery() &&

        validateMessage() &&

        validateTerms();

    if(!valid){

        return;

    }

    alert("Message Sent Successfully");

    contactForm.reset();

}
