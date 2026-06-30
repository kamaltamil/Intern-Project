const hamburger = document.querySelector(".humberger");
const navContent = document.querySelector(".nav-content");

hamburger.addEventListener("click", () => {
    navContent.classList.toggle("active");
    // navBtns.classList.toggle("active");
});