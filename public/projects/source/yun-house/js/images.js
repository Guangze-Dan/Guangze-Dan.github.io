			$('.gallery').magnificPopup({
				delegate: 'a',
				type: 'image',
				gallery: {
					enabled: true
				}
			})
			//This code initializes the Magnific Popup plugin on all elements with the class gallery. It sets the delegate to 'a'


            let menu = document.querySelector("#menu-bar");
let navbar = document.querySelector(".navbar");

// A click event listener to the menu element, which toggles the fa-times class on the menu element and the active class on the navbar element.

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');

}