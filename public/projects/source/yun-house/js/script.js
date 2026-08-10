let menu = document.querySelector("#menu-bar");
let navbar = document.querySelector(".navbar");

// A click event listener to the menu element, which toggles the fa-times class on the menu element and the active class on the navbar element

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');

}

// Back to the top

window.onscroll = () => {

    if (window.scrollY > 80) {
        document.querySelector('#scroll-up').classList.add('active');

    } else {
        document.querySelector('#scroll-up').classList.remove('active');
    }

}

const form = document.querySelector('.order form');
const reservationData = JSON.parse(localStorage.getItem('reservation'));

if (reservationData) {
  form.elements.name.value = reservationData.name;
  form.elements.email.value = reservationData.email;
  form.elements['arrival-time'].value = reservationData['arrival-time'];
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // prevent form from submitting normally

  const formData = new FormData(form); // get form data
  const data = Object.fromEntries(formData.entries()); // convert form data to object

  localStorage.setItem('reservation', JSON.stringify(data)); // store data in local storage
});

const submitButton = document.getElementById('submit-button');

submitButton.addEventListener('click', () => {
  localStorage.setItem('reservation', 'Reservation is submitted!');
  alert('Reservation is submitted!');
});

