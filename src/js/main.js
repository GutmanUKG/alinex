/**
 * Main JavaScript file
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  initHeader();
  initAnimateOnScroll();
  initSmoothScroll();
  initParallax();
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
 * Add data-parallax="0.3" to element (0.1 = slow, 0.5 = fast)
 */
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (!parallaxElements.length) return;

  function updateParallax() {
    const scrollY = window.scrollY;

    parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.2;
      const yOffset = scrollY * speed;

      // Добавляем небольшое движение по X для эффекта
      const xOffset = Math.sin(scrollY * 0.01) * 10 * speed;

      element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
  }

  // Throttle для производительности
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

// Export for use in other modules
window.utils = {
  createSvgIcon
};
