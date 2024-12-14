let slideIndex = 1;
showSlides(slideIndex);

let autoSlide = setInterval(() => plusSlides(1), 3000);

function plusSlides(n) {
    showSlides(slideIndex += n);
    resetAutoSlide();
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetAutoSlide();
}

function showSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active-dot", "");
    }

    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active-dot";
}

function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => plusSlides(1), 3000);
}

// untuk navigasi keatas supaya tidak ketimpah sama header
let lastScrollY = window.scrollY;

function handleScroll() {
    const header = document.querySelector('.header-content');
    const navigation = document.querySelector('.navigation-container');

    if (window.scrollY > lastScrollY) {
        // jika scroll ke bawah
        header.style.transform = 'translateY(-100%)';
        navigation.style.top = '0';
    } else {
        // jika scroll ke atas
        if (window.scrollY === 0) {
            // Jika di posisi paling atas
            header.style.transform = 'translateY(0)';
            navigation.style.top = '44px';
        } else {
            // jika scroll ke atas tapi belum di atas
            header.style.transform = 'translateY(-100%)';
            navigation.style.top = '0';
        }
    }

    lastScrollY = window.scrollY;
}

// saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    lastScrollY = window.scrollY;
    handleScroll();
});

// saat scroll
window.addEventListener('scroll', handleScroll);

// atur ketika navigasi menajdi responsive
document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    const navigation = document.querySelector(".navigation");

    hamburger.addEventListener("click", () => {
        navigation.classList.toggle("active");
    });
});

const sliderTrack = document.querySelector(".slider-track");
const staffCards = document.querySelectorAll(".staff-card");
const cardWidth = staffCards[0].offsetWidth + 20; // Lebar setiap gambar + margin
let currentIndex = 0;

// Buat salinan dinamis untuk semua elemen untuk memastikan perpindahan mulus
const cloneCards = [];
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < staffCards.length; j++) {
    const clone = staffCards[j].cloneNode(true);
    cloneCards.push(clone);
    sliderTrack.appendChild(clone);
  }
}

// Atur posisi awal slider ke indeks pertama
sliderTrack.style.transform = `translateX(-${cardWidth}px)`;

// Pergerakan slider otomatis
function moveSlider() {
  currentIndex++;
  sliderTrack.style.transition = "transform 0.5s ease-in-out";
  sliderTrack.style.transform = `translateX(-${(currentIndex + 1) * cardWidth}px)`;

  if (currentIndex >= staffCards.length) {
    setTimeout(() => {
      sliderTrack.style.transition = "none";
      currentIndex = 0;
      sliderTrack.style.transform = `translateX(-${cardWidth}px)`;
    }, 500);
  }
}

// Jalankan dengan interval otomatis
setInterval(moveSlider, 3000);

document.querySelector('.view-more-link').addEventListener('click', function (event) {
    event.preventDefault();
    document.querySelector('#sarana-prasarana').scrollIntoView({
        behavior: 'smooth'
    });
});
