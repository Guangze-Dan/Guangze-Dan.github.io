let menu = document.querySelector("#menu-bar");
let navbar = document.querySelector(".navbar");

// A click event listener to the menu element, which toggles the fa-times class on the menu element and the active class on the navbar element

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');

}

//Back to the top
window.onscroll = () => {

    if (window.scrollY > 30) {
        document.querySelector('#scroll-up').classList.add('active');

    } else {
        document.querySelector('#scroll-up').classList.remove('active');
    }

}
const scrollBtn = document.querySelector('#scroll-up');

scrollBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
