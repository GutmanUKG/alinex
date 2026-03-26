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
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (!parallaxElements.length) return;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updateParallax() {
    var viewportHeight = window.innerHeight;

    parallaxElements.forEach(function(element, index) {
      var speed = parseFloat(element.dataset.parallax) || 0.2;
      var shouldRotate = element.dataset.parallaxRotate === 'true';
      var maxOffset = parseFloat(element.dataset.parallaxMax) || 50;

      // Позиция секции относительно вьюпорта
      var parent = element.parentElement;
      var rect = parent.getBoundingClientRect();
      var relativeScroll = -(rect.top - viewportHeight / 2);

      // Смещение по Y — ограничено maxOffset
      var yOffset = clamp(relativeScroll * speed, -maxOffset, maxOffset);

      // Плавное движение по X
      var xOffset = Math.sin(relativeScroll * 0.005 + index) * 10;

      // Вращение
      var rotation = shouldRotate ? relativeScroll * 0.03 * speed : 0;

      element.style.transform = 'translate(' + xOffset + 'px, ' + yOffset + 'px) rotate(' + rotation + 'deg)';
    });
  }

  // Throttle
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateParallax();
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
