const hamburger = document.querySelector(".humberger");
const navContent = document.querySelector(".nav-content");

hamburger.addEventListener("click", () => {
    navContent.classList.toggle("active");
});

const signup = document.getElementById("signup");
const signupform = document.querySelector(".singup-form");
const closeBtn = document.querySelector(".close-btn");

signup.addEventListener("click", () => {
    signupform.classList.add("active");
});

closeBtn.addEventListener("click", () => {
    signupform.classList.remove("active");
});

signupform.addEventListener("click", (event) => {
    if (event.target === signupform) {
        signupform.classList.remove("active");
    }
});