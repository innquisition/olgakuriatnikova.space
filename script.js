const TG_BOT_TOKEN = '8528923054:AAFrv6dVJjv3n-tm2K7pqGn9_O0z-vBMPBE';
const TG_CHAT_ID   = '507499767';


// ============================================
// BURGER MENU
// ============================================

const burger   = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');

burger.addEventListener('click', () => {
  // Исправлено: был 'open', теперь 'active' — как в CSS
  navLinks.classList.toggle('active');
  const spans = burger.querySelectorAll('span');

  if (navLinks.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    spans.forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  }
});

// Закрывать меню при клике на ссылку
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    burger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});


// ============================================
// STICKY HEADER SHADOW
// ============================================

const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 4px 20px rgba(90,100,80,0.10)'
    : 'none';
});


// ============================================
// ФОРМА — ОТПРАВКА В TELEGRAM
// ============================================

document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const request = document.getElementById('request').value.trim();
  const format  = document.getElementById('format').value;

  const text = [
    '📩 <b>Новая заявка с сайта</b>',
    '',
    `👤 <b>Имя:</b> ${name}`,
    `📞 <b>Контакт:</b> ${phone}`,
    `💬 <b>Запрос:</b> ${request || 'не указан'}`,
    `📋 <b>Формат:</b> ${format || 'не выбран'}`,
  ].join('\n');

  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = 'Отправляю…';
  btn.disabled = true;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    TG_CHAT_ID,
        text:       text,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();

    if (data.ok) {
      document.getElementById('formSuccess').style.display = 'block';
      this.reset();
      this.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
      btn.style.display = 'none';
    } else {
      throw new Error(data.description || 'Telegram API error');
    }
  } catch (err) {
    console.error('Ошибка отправки:', err);
    alert('Не удалось отправить заявку. Напишите мне напрямую в Telegram 🌿: @kuryatnikova_bot');
    btn.textContent = 'Отправить заявку';
    btn.disabled    = false;
  }
});


// ============================================
// SCROLL ANIMATION
// ============================================

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .review, .topic, .timeline__item, .contact-card').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  scrollObserver.observe(el);
});


// ============================================
// КРУГЛОЕ ВИДЕО КАК В TELEGRAM
// ============================================

const videoCircle    = document.getElementById('videoCircle');
const circleVideo    = document.getElementById('circleVideo');
const playButton     = document.getElementById('playButton');
const soundIndicator = document.getElementById('soundIndicator');

if (videoCircle && circleVideo) {
  let isPreviewMode          = true;
  let hasStartedFullPlayback = false;

  const playIcon  = playButton?.querySelector('.play-icon');
  const pauseIcon = playButton?.querySelector('.pause-icon');

  // Показать/скрыть иконки кнопки
  function setPlayButtonIcon(showPause) {
    if (!playIcon || !pauseIcon) return;
    playIcon.style.display  = showPause ? 'none'  : '';
    pauseIcon.style.display = showPause ? ''       : 'none';
  }

  // Скрыть/показать кнопку play
  function setPlayButtonVisible(visible) {
    if (!playButton) return;
    playButton.style.opacity        = visible ? '1' : '0';
    playButton.style.pointerEvents  = visible ? 'auto' : 'none';
    playButton.style.transition     = 'opacity 0.3s ease';
  }

  const videoVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasStartedFullPlayback) {
        startPreview();
      } else if (!entry.isIntersecting && isPreviewMode) {
        stopPreview();
      }
    });
  }, { threshold: 0.5 });

  videoVisibilityObserver.observe(videoCircle);

  function startPreview() {
    circleVideo.muted = true;
    circleVideo.loop  = true;
    circleVideo.play().catch(err => console.log('Автовоспроизведение заблокировано:', err));
    videoCircle.classList.add('preview');
    setPlayButtonVisible(true);
    setPlayButtonIcon(false); // показать ▶
  }

  function stopPreview() {
    if (!isPreviewMode) return;
    circleVideo.pause();
    circleVideo.currentTime = 0;
    videoCircle.classList.remove('preview');
  }

  videoCircle.addEventListener('click', () => {
    isPreviewMode ? startFullPlayback() : stopFullPlayback();
  });

  function startFullPlayback() {
    isPreviewMode          = false;
    hasStartedFullPlayback = true;

    circleVideo.currentTime = 0;
    circleVideo.muted       = false;
    circleVideo.loop        = false;
    circleVideo.play();

    videoCircle.classList.remove('preview');
    videoCircle.classList.add('playing');

    // Скрываем кнопку play во время воспроизведения
    setPlayButtonVisible(false);

    showSoundIndicator();
    circleVideo.addEventListener('ended', onVideoEnded, { once: true });
  }

  function stopFullPlayback() {
    circleVideo.pause();
    circleVideo.currentTime = 0;
    circleVideo.muted       = true;
    circleVideo.loop        = true;

    videoCircle.classList.remove('playing');
    isPreviewMode          = true;
    hasStartedFullPlayback = false;

    setPlayButtonVisible(true);
    setPlayButtonIcon(false);
    startPreview();
  }

  function onVideoEnded() {
    videoCircle.classList.remove('playing');
    setPlayButtonVisible(true);
    setPlayButtonIcon(false);

    setTimeout(() => {
      isPreviewMode          = true;
      hasStartedFullPlayback = false;
      startPreview();
    }, 500);
  }

  function showSoundIndicator() {
    if (!soundIndicator) return;
    soundIndicator.classList.add('show');
    setTimeout(() => soundIndicator.classList.remove('show'), 1500);
  }

  circleVideo.addEventListener('loadedmetadata', () => {
    const duration   = Math.floor(circleVideo.duration);
    const durationEl = videoCircle.querySelector('.video-circle__duration');
    if (!durationEl) return;
    durationEl.textContent = `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`;
  });
}


// ============================================
// АНИМАЦИЯ ПОЯВЛЕНИЯ СООБЩЕНИЙ
// ============================================

const messageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.message').forEach((message, index) => {
  message.style.opacity    = '0';
  message.style.transform  = 'translateY(20px)';
  message.style.transition = `all 0.5s ease ${index * 0.1}s`;
  messageObserver.observe(message);
});