const API_BASE = `${window.location.origin}/api`;
const API_ORIGIN = window.location.origin;

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mediaUrl(path) {
  if (!path) return './img/logoPaquena.png';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
  return path;
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error('Falha ao carregar dados.');
  return res.json();
}

async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let message = 'Nao foi possivel enviar os dados.';
    try {
      const body = await res.json();
      message = body.erro || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

function initPageTransitions() {
  requestAnimationFrame(() => document.body.classList.add('page-ready'));

  qsa('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const isInternalPage =
      href &&
      !href.startsWith('#') &&
      !href.startsWith('http') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:') &&
      !link.target;

    if (!isInternalPage) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.add('page-leave');
      setTimeout(() => {
        window.location.href = href;
      }, 220);
    });
  });
}

function initHeader() {
  const header = qs('.site-header');
  const menu = qs('.menu');
  const button = qs('.hamburger');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  qsa('.menu a').forEach((link) => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  window.addEventListener('scroll', () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  }, { passive: true });

  button?.setAttribute('role', 'button');
  button?.setAttribute('tabindex', '0');
  button?.setAttribute('aria-label', 'Abrir menu');
  button?.setAttribute('aria-expanded', 'false');

  function toggleMenu() {
    const open = !menu?.classList.contains('open');
    menu?.classList.toggle('open', open);
    button?.classList.toggle('active', open);
    button?.setAttribute('aria-expanded', String(open));
  }

  button?.addEventListener('click', toggleMenu);
  button?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMenu();
    }
  });

  qsa('.menu a').forEach((link) => {
    link.addEventListener('click', () => {
      menu?.classList.remove('open');
      button?.classList.remove('active');
      button?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initReveal() {
  qsa('.section, .hero-title, .carousel, .contact-box, .table-wrap, .texto-box').forEach((el) => {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  qsa('.reveal').forEach((el, index) => {
    el.style.setProperty('--reveal-delay', `${Math.min(index * 45, 260)}ms`);
    observer.observe(el);
  });
}

function refreshRevealTargets(container = document) {
  qsa('.card, .foto, tbody tr', container).forEach((el, index) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(index * 55, 330)}ms`);
    requestAnimationFrame(() => el.classList.add('active'));
  });
}

function initCarousel() {
  const track = qs('.carousel-track');
  if (!track) return;

  const slides = qsa('.slide', track);
  if (!slides.length) return;

  let index = 0;
  let timer = null;

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function go(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    render();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 5500);
  }

  qs('.nav.prev')?.addEventListener('click', () => {
    go(index - 1);
    restart();
  });

  qs('.nav.next')?.addEventListener('click', () => {
    go(index + 1);
    restart();
  });

  render();
  restart();
}

function openModal({ modal, image, title, description }) {
  if (!modal) return;

  const modalImage = qs('img', modal);
  const modalTitle = qs('h3', modal);
  const modalDescription = qs('p', modal);

  if (modalImage) {
    modalImage.src = image || './img/logoPaquena.png';
    modalImage.alt = title || '';
  }
  if (modalTitle) modalTitle.textContent = title || '';
  if (modalDescription) modalDescription.textContent = description || '';

  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function initModals() {
  qsa('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('.modal-close')) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    qsa('.modal').forEach((modal) => modal.classList.add('hidden'));
    document.body.classList.remove('modal-open');
  });
}

async function loadQuemSomos() {
  const box = qs('#quem-somos-conteudo');
  if (!box) return;

  try {
    const page = await apiGet('/paginas/quem-somos');
    const title = qs('#quem-somos-titulo');

    if (title && page.titulo) title.textContent = page.titulo;
    box.innerHTML = page.conteudo || '<p>Conteudo nao encontrado.</p>';
  } catch {
    box.innerHTML = '<p class="error-text">Erro ao carregar conteudo.</p>';
  }
}

async function loadBanners() {
  const track = qs('#banners-track');
  if (!track) return;

  try {
    const banners = await apiGet('/banners');
    track.innerHTML =
      banners
        .filter((banner) => banner.ativo)
        .map((banner) => `
          <a class="slide" href="${escapeHtml(banner.link || '#')}">
            <img src="${mediaUrl(banner.imagem)}" alt="${escapeHtml(banner.titulo || 'Banner')}">
            <span class="slide-shine"></span>
          </a>
        `)
        .join('') || '<p class="empty-state">Nenhum banner cadastrado.</p>';

    initCarousel();
  } catch {
    track.innerHTML = '<p class="empty-state">Erro ao carregar banners.</p>';
  }
}

async function loadAcoes() {
  const wrap = qs('#lista-acoes');
  if (!wrap) return;

  try {
    const actions = await apiGet('/acoes');
    const visible = actions.filter((action) => action.ativo !== 0);

    wrap.innerHTML =
      visible
        .map((action) => `
          <article class="card action-card" data-title="${escapeHtml(action.titulo)}" data-description="${escapeHtml(action.descricao || '')}" data-image="${mediaUrl(action.imagem)}">
            <img src="${mediaUrl(action.imagem)}" alt="${escapeHtml(action.titulo)}">
            <div class="card-body">
              <span class="tag">Acao social</span>
              <h3>${escapeHtml(action.titulo)}</h3>
              <p>${escapeHtml(action.descricao || '')}</p>
              <button class="btn btn-sm btn-abrir-acao" type="button">Ver detalhes</button>
            </div>
          </article>
        `)
        .join('') || '<p class="empty-state">Nenhuma acao cadastrada.</p>';

    wrap.addEventListener('click', (event) => {
      const card = event.target.closest('.action-card');
      if (!card) return;
      openModal({
        modal: qs('#modal-acao'),
        image: card.dataset.image,
        title: card.dataset.title,
        description: card.dataset.description
      });
    });

    refreshRevealTargets(wrap);
  } catch {
    wrap.innerHTML = '<p class="empty-state">Erro ao carregar acoes.</p>';
  }
}

async function loadProjetos(limit = null) {
  const wrap = qs('#lista-projetos');
  if (!wrap) return;

  try {
    const projects = await apiGet('/projetos');
    const list = limit ? projects.slice(0, limit) : projects;

    wrap.innerHTML =
      list
        .map((project) => {
          const description = project.descricao || project.resumo || project.conteudo || '';
          return `
            <article class="card project-card" data-title="${escapeHtml(project.titulo)}" data-description="${escapeHtml(description)}" data-image="${mediaUrl(project.imagem)}">
              <img src="${mediaUrl(project.imagem)}" alt="${escapeHtml(project.titulo)}">
              <div class="card-body">
                <span class="tag">${escapeHtml(project.categoria || 'Projeto')}</span>
                <h3>${escapeHtml(project.titulo)}</h3>
                <p>${escapeHtml(description)}</p>
              </div>
            </article>
          `;
        })
        .join('') || '<p class="empty-state">Nenhum projeto.</p>';

    wrap.addEventListener('click', (event) => {
      const card = event.target.closest('.project-card');
      if (!card || !qs('#modal-projeto')) return;
      openModal({
        modal: qs('#modal-projeto'),
        image: card.dataset.image,
        title: card.dataset.title,
        description: card.dataset.description
      });
    });

    refreshRevealTargets(wrap);
  } catch {
    wrap.innerHTML = '<p class="empty-state">Erro ao carregar projetos.</p>';
  }
}

async function loadGaleria() {
  const wrap = qs('#lista-galeria');
  if (!wrap) return;

  try {
    const photos = (await apiGet('/galeria')).filter((photo) => photo.ativo !== 0);

    function render(query = '') {
      const normalized = query.trim().toLowerCase();
      const filtered = photos.filter((photo) => {
        const text = `${photo.titulo || ''} ${photo.descricao || ''}`.toLowerCase();
        return !normalized || text.includes(normalized);
      });

      wrap.innerHTML =
        filtered
          .map((photo) => `
            <figure class="foto" data-title="${escapeHtml(photo.titulo || '')}" data-description="${escapeHtml(photo.descricao || '')}" data-image="${mediaUrl(photo.imagem)}">
              <img src="${mediaUrl(photo.imagem)}" alt="${escapeHtml(photo.titulo || 'Foto da galeria')}">
              <figcaption>
                <strong>${escapeHtml(photo.titulo || 'Registro da galeria')}</strong>
                <span>${escapeHtml(photo.descricao || 'Clique para ampliar')}</span>
              </figcaption>
            </figure>
          `)
          .join('') || '<p class="empty-state">Nenhuma foto encontrada.</p>';

      refreshRevealTargets(wrap);
    }

    qs('#busca-galeria')?.addEventListener('input', (event) => render(event.target.value));
    wrap.addEventListener('click', (event) => {
      const photo = event.target.closest('.foto');
      if (!photo) return;
      openModal({
        modal: qs('#modal-galeria'),
        image: photo.dataset.image,
        title: photo.dataset.title,
        description: photo.dataset.description
      });
    });

    render();
  } catch {
    wrap.innerHTML = '<p class="empty-state">Erro ao carregar galeria.</p>';
  }
}

async function loadPrestacao() {
  const tableBody = qs('#prestacao-body');
  if (!tableBody) return;

  try {
    const docs = await apiGet('/prestacao-contas');
    tableBody.innerHTML =
      docs
        .filter((doc) => doc.ativo !== 0)
        .map((doc) => `
          <tr>
            <td>${escapeHtml(doc.titulo)}</td>
            <td>${escapeHtml(doc.ano || '-')}</td>
            <td>${escapeHtml(doc.mes || '-')}</td>
            <td>${escapeHtml(doc.descricao || '-')}</td>
            <td>
              ${doc.arquivo ? `<a class="table-link" href="${mediaUrl(doc.arquivo)}" target="_blank" rel="noopener">Abrir</a>` : '-'}
            </td>
          </tr>
        `)
        .join('') || '<tr><td colspan="5">Nenhum documento publicado.</td></tr>';

    refreshRevealTargets(tableBody);
  } catch {
    tableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar documentos.</td></tr>';
  }
}

function initContactForm() {
  const form = qs('#contato-form');
  const status = qs('#contato-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    status.textContent = 'Enviando mensagem...';
    status.className = 'muted';

    try {
      await apiPost('/contatos', data);
      form.reset();
      status.textContent = 'Mensagem enviada com sucesso.';
      status.className = 'status success';
    } catch (error) {
      status.textContent = error.message;
      status.className = 'status error';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initHeader();
  initModals();
  initReveal();
  initContactForm();

  loadBanners();
  loadAcoes();
  loadProjetos(qs('#modal-projeto') ? null : 3);
  loadGaleria();
  loadPrestacao();
  loadQuemSomos();
});
