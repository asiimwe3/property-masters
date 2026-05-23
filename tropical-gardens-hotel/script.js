// ===========================
//  TROPICAL GARDENS HOTEL JS
// ===========================

// ----- NAVBAR SCROLL -----
const navbar = document.getElementById('navbar')
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled')
  else navbar.classList.remove('scrolled')
})

// ----- HAMBURGER MENU -----
const hamburger = document.getElementById('hamburger')
const navLinks = document.getElementById('nav-links')
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open')
  const spans = hamburger.querySelectorAll('span')
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)'
    spans[1].style.opacity = '0'
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)'
  } else {
    spans[0].style.transform = ''
    spans[1].style.opacity = ''
    spans[2].style.transform = ''
  }
})
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open')
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '' })
  })
})

// ----- HERO BG ANIMATION -----
document.addEventListener('DOMContentLoaded', () => {
  const heroBg = document.querySelector('.hero-bg')
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100)

  // Set default check-in / check-out dates
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(today.getDate() + 3)

  const fmt = d => d.toISOString().split('T')[0]
  const cin = document.getElementById('checkin')
  const cout = document.getElementById('checkout')
  if (cin) { cin.value = fmt(tomorrow); cin.min = fmt(today) }
  if (cout) { cout.value = fmt(dayAfter); cout.min = fmt(tomorrow) }
  if (cin && cout) {
    cin.addEventListener('change', () => {
      const next = new Date(cin.value)
      next.setDate(next.getDate() + 1)
      cout.min = fmt(next)
      if (cout.value <= cin.value) cout.value = fmt(next)
    })
  }
})

// ----- BOOKING FORM -----
function handleBooking(e) {
  e.preventDefault()
  const checkin = document.getElementById('checkin').value
  const checkout = document.getElementById('checkout').value
  const guests = document.getElementById('guests').value
  const room = document.getElementById('roomtype').value

  if (!checkin || !checkout) { alert('Please select check-in and check-out dates.'); return }
  if (checkout <= checkin) { alert('Check-out must be after check-in.'); return }

  // Calculate nights
  const nights = Math.round((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24))

  showToast(`✅ Enquiry sent for ${room} — ${nights} night${nights > 1 ? 's' : ''}, ${guests}. We'll confirm shortly!`)
  document.getElementById('book').scrollIntoView({ behavior: 'smooth' })
}

// ----- CONTACT FORM -----
function handleContact(e) {
  e.preventDefault()
  const form = e.target
  form.reset()
  showToast('✅ Message sent! Our team will be in touch within 24 hours.')
}

// ----- TOAST -----
function showToast(msg) {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 4500)
}

// ----- SCROLL REVEAL -----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed')
      revealObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

document.querySelectorAll('.room-card, .amenity-card, .testi-card, .gallery-item, .dining-item').forEach(el => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(24px)'
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
  revealObserver.observe(el)
})

document.addEventListener('scroll', () => {
  document.querySelectorAll('.revealed').forEach(el => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })
}, { passive: true })

// Trigger for elements already in view
setTimeout(() => {
  document.querySelectorAll('[style*="opacity: 0"]').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }
  })
}, 300)

// ----- GALLERY LIGHTBOX -----
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img')
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;
      display:flex;align-items:center;justify-content:center;cursor:zoom-out;
      animation:fadeUp 0.3s ease;
    `
    const imgEl = document.createElement('img')
    imgEl.src = img.src
    imgEl.alt = img.alt
    imgEl.style.cssText = 'max-width:92vw;max-height:88vh;object-fit:contain;border-radius:8px;box-shadow:0 20px 80px rgba(0,0,0,0.5);'
    overlay.appendChild(imgEl)
    overlay.addEventListener('click', () => overlay.remove())
    document.body.appendChild(overlay)
    document.body.style.overflow = 'hidden'
    overlay.addEventListener('click', () => { overlay.remove(); document.body.style.overflow = '' })
  })
})
