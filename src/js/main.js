/**
 * Main JavaScript file
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  initHeader();
  initAnimateOnScroll();
  initSmoothScroll();
  initParallax();
  initBannerParallax();
  initCounter();
  initMapDots();

  initSliderConditions();
  ininInfoSlider();
  initBurger();









});

/**
 * Header scroll effect
 */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const scrollThreshold = 50;

  function updateHeader() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader);
  updateHeader();
}

/**
 * Banner parallax — image moves slower than scroll for depth effect
 */
function initBannerParallax() {
  // Отключаем на мобильных для плавности скролла
  if (window.innerWidth < 768) return;

  var banner = document.querySelector('.banner');
  if (!banner) return;
  var img = banner.querySelector('img');
  if (!img) return;

  var ticking = false;

  function update() {
    var rect = banner.getBoundingClientRect();
    var bannerHeight = banner.offsetHeight;
    // progress: 0 (баннер вверху вьюпорта) → 1 (баннер ушёл вверх)
    var progress = -rect.top / bannerHeight;
    progress = Math.max(0, Math.min(1, progress));

    // Сдвигаем картинку вверх на 20% от высоты (т.к. она на 20% больше)
    var yShift = progress * -20;
    img.style.transform = 'translateY(' + yShift + '%)';
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        update();
        ticking = false;
      });
      ticking = true;
    }
  });

  update();
}

/**
 * Animate elements on scroll
 * Add data-animate attribute to elements
 * Example: <div data-animate="fadeInUp" data-delay="200">
 */
function initAnimateOnScroll() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  if (!animatedElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const animation = element.dataset.animate;
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
          element.classList.add('animate__animated', `animate__${animation}`, 'animated');
        }, parseInt(delay));

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Smooth scroll to anchors
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * SVG sprite usage helper
 * Usage: createSvgIcon('icon-name', 'optional-class')
 */
function createSvgIcon(name, className = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `icon ${className}`.trim());

  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `img/sprite.svg#${name}`);

  svg.appendChild(use);
  return svg;
}

/**
 * Parallax effect for coins
 * data-parallax="0.3" - скорость
 * data-parallax-rotate="true" - вращение
 */
function initParallax() {
  // Отключаем параллакс на мобильных (< 768px) - слишком много событий скролла вызывают тряску
  if (window.innerWidth < 768) return;

  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (!parallaxElements.length) return;

  var coinShake = 7;
  var coinDamping = 0.92;
  var coinStiffness = 0.04;
  var running = false;

  // У каждой монеты своя физика
  var coins = [];
  parallaxElements.forEach(function(el, i) {
    coins.push({
      el: el,
      offset: 0,
      velocity: 0,
      flipSign: i % 2 === 0 ? 1 : -1,
      // Разная жёсткость и затухание — разный ритм
      stiffness: coinStiffness + i * 0.02,
      damping: coinDamping - i * 0.02
    });
  });

  function tick() {
    var allSettled = true;

    coins.forEach(function(c) {
      c.velocity = (c.velocity - c.offset * c.stiffness) * c.damping;
      c.offset += c.velocity;

      if (Math.abs(c.offset) < 0.05 && Math.abs(c.velocity) < 0.05) {
        c.offset = 0;
        c.velocity = 0;
        c.el.style.transform = 'translateX(0)';
      } else {
        allSettled = false;
        c.el.style.transform = 'translateX(' + c.offset.toFixed(2) + 'px)';
      }
    });

    if (allSettled) {
      running = false;
      return;
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', function() {
    coins.forEach(function(c) {
      c.flipSign *= -1;
      c.velocity += c.flipSign * coinShake;
    });

    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  });
}

/**
 * Counter animation on scroll
 * data-target на .counter__increment — целевое число
 */
function initCounter() {
  var counter = document.querySelector('.counter__increment');
  if (!counter) return;

  var target = parseInt(counter.dataset.target, 10);
  if (isNaN(target)) return;

  var spans = counter.querySelectorAll('.counter__digit span');
  if (!spans.length) return;

  var totalDigits = spans.length;
  var animated = false;
  var duration = 2500;

  function setDigits(number) {
    var str = String(number).padStart(totalDigits, '0');
    for (var i = 0; i < totalDigits; i++) {
      spans[i].textContent = str[i];
    }
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animate() {
    if (animated) return;
    animated = true;

    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var current = Math.round(easedProgress * target);

      setDigits(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDigits(target);
      }
    }

    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animate();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(counter);
}

// Export for use in other modules
window.utils = {
  createSvgIcon
};


function initBurger() {
  var burger = document.querySelector('.header__burger');
  var menu = document.querySelector('.header__menu');
  if (!burger || !menu) return;

  function closeMenu() {
    menu.classList.remove('active');
  }

  burger.addEventListener('click', function() {
    menu.classList.add('active');
  });

  // Закрытие по клику на крестик (верхняя левая область ::before)
  menu.addEventListener('click', function(e) {
    if (e.target === menu && e.offsetX < 60 && e.offsetY < 60) {
      closeMenu();
    }
  });

  // Закрытие по клику на ссылку
  menu.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', closeMenu);
  });
}

function initSliderConditions(){
  if(document.body.clientWidth < 1201){
    const conditions_container = document.querySelector('#conditions');
    let steps_list = conditions_container.querySelector('.steps__list');

    steps_list.classList.add('owl-carousel')
    steps_list.classList.add('owl-theme')

    $('.steps__list').owlCarousel({
      loop:false,
      margin:10,
      nav:false,
      autoplay: false,
      dots: true,
      responsive:{
        0:{
          items:1,
          center: true,
          autoWidth: true
        },
        400: {
          items: 1,
          center: true,
          autoWidth: true
        },
        600:{
          items:2
        },
        800: {
          items: 3
        }
      }
    })
  }
}

function ininInfoSlider() {
  $('.info__slider').owlCarousel({
    loop:false,
    margin:10,
    nav:true,
    autoplay: false,
    dots: false,
    autoHeight: true,
    responsive:{
      0:{
        items:1,

      },

    }
  })
}

/**
 * Map dots - показ тултипа по клику
 */
function initMapDots() {
  var dots = document.querySelectorAll('.map__dot');
  if (!dots.length) return;

  dots.forEach(function(dot) {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      var isActive = this.classList.contains('active');

      // Закрыть все остальные
      dots.forEach(function(d) {
        d.classList.remove('active');
      });

      // Если не была активна - открыть
      if (!isActive) {
        this.classList.add('active');
      }
    });
  });

  // Закрыть при клике вне точки
  document.addEventListener('click', function() {
    dots.forEach(function(d) {
      d.classList.remove('active');
    });
  });
}