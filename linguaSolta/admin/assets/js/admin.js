const API_BASE = localStorage.getItem('site_admin_api_base') || window.API_BASE || '/api';
const API_ORIGIN = /^https?:\/\//i.test(API_BASE) ? API_BASE.replace(/\/api\/?$/, '') : '';

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const token = () => localStorage.getItem('site_admin_token') || '';

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith('/') && API_ORIGIN ? `${API_ORIGIN}${path}` : path;
}

function setStatus(element, message, type = 'muted') {
  if (!element) return;
  element.textContent = message;
  element.className = `status ${type}`;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('site_admin_user') || 'null');
  } catch {
    return null;
  }
}

function ensureAuth() {
  if (!location.pathname.endsWith('login.html') && !token()) {
    location.href = 'login.html';
  }
}

function markCurrentNav() {
  const current = location.pathname.split('/').pop();
  qsa('.sidebar nav a').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === current);
  });
}

async function request(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };

  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token()) {
    headers.Authorization = `Bearer ${token()}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  if (res.status === 401 && !location.pathname.endsWith('login.html')) {
    logout(true);
    throw new Error('Sessao expirada. Faca login novamente.');
  }

  if (!res.ok) {
    let message = 'Erro na requisicao.';
    try {
      const body = await res.json();
      message = body.erro || body.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.headers.get('content-type')?.includes('application/json')
    ? res.json()
    : res.text();
}

async function sendForm(path, form, editingId = '') {

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${path}/${editingId}` : path;

    const formData = new FormData(form);

    // Checkbox "capa"
    const capa = form.querySelector('[name=capa]');

    if (capa) {

        formData.set('capa', capa.checked ? 1 : 0);

    }

    return request(url, {

        method,
        body: formData

    });

}

function fillSidebar() {
  const out = qs('#sidebar-user');
  const user = getStoredUser();
  if (out) {
    out.textContent = user ? `${user.nome || 'Usuario'} - ${user.tipo || 'admin'}` : 'Painel administrador';
  }
}

function logout(silent = false) {
  localStorage.removeItem('site_admin_token');
  localStorage.removeItem('site_admin_user');
  if (!silent) location.href = 'login.html';
}

async function doLogin(event) {
  event.preventDefault();
  const form = event.target;
  const status = qs('#login-status');
  const payload = Object.fromEntries(new FormData(form).entries());

  setStatus(status, 'Entrando...', 'muted');

  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    localStorage.setItem('site_admin_token', data.token);
    localStorage.setItem('site_admin_user', JSON.stringify(data.usuario));
    location.href = 'dashboard.html';
  } catch (error) {
    setStatus(status, error.message, 'error');
  }
}

async function loadDashboard() {
  const countProjetos = qs('#count-projetos');
  if (!countProjetos) return;

  try {
    const [
    acoes,
    projetos,
    galeria,
    banners,
    contatos,
    prestacao,
    equipe
] = await Promise.all([
    request('/acoes'),
    request('/projetos'),
    request('/galeria'),
    request('/banners'),
    request('/contatos'),
    request('/prestacao-contas'),
    request('/equipe')
]);

    qs('#count-acoes') && (qs('#count-acoes').textContent = acoes.length);
    countProjetos.textContent = projetos.length;
    qs('#count-galeria').textContent = galeria.length;
    qs('#count-banners').textContent = banners.length;
    qs('#count-equipe') &&
    (qs('#count-equipe').textContent = equipe.length);
    qs('#count-contatos').textContent = contatos.length;
    qs('#count-prestacao').textContent = prestacao.length;

    const activities = qs('#ultimas-atividades');
    if (!activities) return;

    activities.innerHTML =
      [
        ...projetos.slice(0, 3).map((item) => ['Projeto', item.titulo, item.criado_em]),
        ...contatos.slice(0, 3).map((item) => ['Contato', item.nome, item.criado_em])
      ]
        .slice(0, 6)
        .map(([type, title, date]) => `
          <tr>
            <td><span class="pill">${escapeHtml(type)}</span></td>
            <td>${escapeHtml(title || '-')}</td>
            <td>${date ? new Date(date).toLocaleDateString('pt-BR') : '-'}</td>
          </tr>
        `)
        .join('') || '<tr><td colspan="3">Sem atividades.</td></tr>';
  } catch (error) {
    const activities = qs('#ultimas-atividades');
    if (activities) activities.innerHTML = `<tr><td colspan="3">${escapeHtml(error.message)}</td></tr>`;
  }
}

function thumb(path, alt = '') {
  return path ? `<img class="thumb" src="${mediaUrl(path)}" alt="${escapeHtml(alt)}">` : '<span class="muted">Sem imagem</span>';
}

function actionButtons(id, extra = '') {
  return `
    <div class="toolbar row-actions">
      ${extra}
      <button class="btn alt" data-edit="${escapeHtml(id)}" type="button">Editar</button>
      <button class="btn danger" data-del="${escapeHtml(id)}" type="button">Excluir</button>
    </div>
  `;
}

function bindCrud({
  formId,
  tableId,
  statusId,
  endpoint,
  cacheName,
  columns,
  empty,
  fillForm,
  cancelId
}) {
  const form = qs(formId);
  const table = qs(tableId);
  const status = qs(statusId);
  if (!form || !table) return;

  let editingId = '';

  async function refresh() {
    try {
      const items = await request(endpoint);
      window[cacheName] = items;
      table.innerHTML =
        items.map((item) => `
          <tr>
            ${columns(item)}
            <td>${actionButtons(item.id)}</td>
          </tr>
        `).join('') || empty;
    } catch (error) {
      table.innerHTML = `<tr><td colspan="8">${escapeHtml(error.message)}</td></tr>`;
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, 'Salvando...', 'muted');

    try {
      await sendForm(endpoint, form, editingId);
      form.reset();
      editingId = '';
      setStatus(status, 'Registro salvo com sucesso.', 'success');
      await refresh();
    } catch (error) {
      setStatus(status, error.message, 'error');
    }
  });

  table.addEventListener('click', async (event) => {
    const edit = event.target.dataset.edit;
    const del = event.target.dataset.del;

    if (edit) {
      const item = (window[cacheName] || []).find((entry) => String(entry.id) === String(edit));
      if (!item) return;

      editingId = edit;
      fillForm(item, form);
      setStatus(status, 'Modo edicao ativado.', 'muted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (del && confirm('Excluir este registro?')) {
      try {
        await request(`${endpoint}/${del}`, { method: 'DELETE' });
        setStatus(status, 'Registro excluido com sucesso.', 'success');
        await refresh();
      } catch (error) {
        setStatus(status, error.message, 'error');
      }
    }
  });

  qs(cancelId)?.addEventListener('click', () => {
    editingId = '';
    form.reset();
    setStatus(status, 'Formulario limpo.', 'muted');
  });

  refresh();
}

function bindAcoes() {
  bindCrud({
    formId: '#form-acoes',
    tableId: '#tbody-acoes',
    statusId: '#status-acoes',
    endpoint: '/acoes',
    cacheName: '__acoes',
    empty: '<tr><td colspan="6">Nenhuma acao cadastrada.</td></tr>',
    columns: (item) => `
      <td>${thumb(item.imagem, item.titulo)}</td>
      <td>${escapeHtml(item.titulo || '-')}</td>
      <td>${escapeHtml(item.descricao || '-')}</td>
      <td>${escapeHtml(item.ordem ?? 0)}</td>
      <td><span class="pill ${item.ativo ? 'success' : 'muted'}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
    `,
    fillForm: (item, form) => {
      qs('[name=titulo]', form).value = item.titulo || '';
      qs('[name=link]', form).value = item.link || '';
      qs('[name=ordem]', form).value = item.ordem || 0;
      qs('[name=ativo]', form).value = String(item.ativo);
      qs('[name=descricao]', form).value = item.descricao || '';
    },
    cancelId: '#cancelar-acao'
  });
}

function bindProjetos() {
  bindCrud({
    formId: '#form-projeto',
    tableId: '#tbody-projetos',
    statusId: '#status-projetos',
    endpoint: '/projetos',
    cacheName: '__projetos',
    empty: '<tr><td colspan="3">Nenhum projeto cadastrado.</td></tr>',
    columns: (item) => `
      <td>${thumb(item.imagem, item.titulo)}</td>
      <td>${escapeHtml(item.titulo || '-')}</td>
    `,
    fillForm: (item, form) => {
      qs('[name=titulo]', form).value = item.titulo || '';
      qs('[name=descricao]', form).value = item.descricao || item.resumo || item.conteudo || '';
    },
    cancelId: '#cancelar-projeto'
  });
}

function bindGaleria() {

    bindCrud({

        formId: '#form-galeria',

        tableId: '#tbody-galeria',

        statusId: '#status-galeria',

        endpoint: '/galeria',

        cacheName: '__galeria',

        empty: 'Nenhuma foto cadastrada.',

        columns: (item) => `

            <td>

                <img
                    src="${mediaUrl(item.imagem)}"
                    style="width:80px;height:60px;object-fit:cover;border-radius:8px">

            </td>

            <td>

                ${item.ano || "-"}

            </td>

            <td>

                ${
                    Number(item.capa) === 1
                        ? '<span class="badge success">Capa</span>'
                        : '-'
                }

            </td>

            <td>

                ${escapeHtml(item.titulo || "")}

            </td>

            <td>

                ${item.ordem ?? 0}

            </td>

        `,

        fillForm: (item, form) => {

    qs('[name=titulo]', form).value = item.titulo || '';

    qs('[name=ano]', form).value = item.ano || '';

    qs('[name=descricao]', form).value = item.descricao || '';

    qs('[name=ordem]', form).value = item.ordem || 0;

    qs('[name=ativo]', form).value = String(item.ativo);

    const capa = qs('[name=capa]', form);

    if (capa) {

        capa.checked = Number(item.capa) === 1;

    }

}

    });

}

function bindBanners() {
  bindCrud({
    formId: '#form-banners',
    tableId: '#tbody-banners',
    statusId: '#status-banners',
    endpoint: '/banners',
    cacheName: '__banners',
    empty: '<tr><td colspan="6">Nenhum banner cadastrado.</td></tr>',
    columns: (item) => `
      <td>${thumb(item.imagem, item.titulo)}</td>
      <td>${escapeHtml(item.titulo || '-')}</td>
      <td>${escapeHtml(item.link || '-')}</td>
      <td>${escapeHtml(item.ordem ?? 0)}</td>
      <td><span class="pill ${item.ativo ? 'success' : 'muted'}">${item.ativo ? 'Ativo' : 'Inativo'}</span></td>
    `,
    fillForm: (item, form) => {
      qs('[name=titulo]', form).value = item.titulo || '';
      qs('[name=link]', form).value = item.link || '';
      qs('[name=ordem]', form).value = item.ordem || 0;
      qs('[name=ativo]', form).value = String(item.ativo);
    }
  });
}

function bindPrestacao() {
  bindCrud({
    formId: '#form-prestacao',
    tableId: '#tbody-prestacao',
    statusId: '#status-prestacao',
    endpoint: '/prestacao-contas',
    cacheName: '__prestacao',
    empty: '<tr><td colspan="5">Nenhum documento.</td></tr>',
    columns: (item) => `
      <td>${escapeHtml(item.titulo || '-')}</td>
      <td>${escapeHtml(item.ano || '-')}</td>
      <td>${escapeHtml(item.mes || '-')}</td>
      <td>${item.arquivo ? `<a class="link" href="${mediaUrl(item.arquivo)}" target="_blank" rel="noopener">Abrir</a>` : '-'}</td>
    `,
    fillForm: (item, form) => {
      qs('[name=titulo]', form).value = item.titulo || '';
      qs('[name=ano]', form).value = item.ano || '';
      qs('[name=mes]', form).value = item.mes || '';
      qs('[name=descricao]', form).value = item.descricao || '';
      qs('[name=ativo]', form).value = String(item.ativo);
    }
  });
}

function bindEquipe() {

    bindCrud({

        formId: '#equipeForm',

        tableId: '#listaEquipe',

        statusId: '#status-equipe',

        endpoint: '/equipe',

        cacheName: '__equipe',

        empty: '<tr><td colspan="6">Nenhum membro cadastrado.</td></tr>',

        columns: (item) => `

            <td>${thumb(item.foto, item.nome)}</td>

            <td>${escapeHtml(item.nome || '-')}</td>

            <td>${escapeHtml(item.cargo || '-')}</td>

            <td>${escapeHtml(item.ordem ?? 0)}</td>

            <td>

                <span class="pill ${Number(item.ativo) ? 'success' : 'muted'}">

                    ${Number(item.ativo) ? 'Ativo' : 'Inativo'}

                </span>

            </td>

        `,

        fillForm: (item, form) => {

            qs('#id', form).value = item.id || '';

            qs('#nome', form).value = item.nome || '';

            qs('#cargo', form).value = item.cargo || '';

            qs('#biografia', form).value = item.biografia || '';

            qs('#facebook', form).value = item.facebook || '';

            qs('#instagram', form).value = item.instagram || '';

            qs('#whatsapp', form).value = item.whatsapp || '';

            qs('#ordem', form).value = item.ordem ?? 0;

            qs('#ativo', form).value = String(item.ativo ?? 1);

            const preview = qs('#preview', form);

            if (preview) {

                if (item.foto) {

                    preview.src = mediaUrl(item.foto);

                    preview.style.display = 'block';

                } else {

                    preview.src = '';

                    preview.style.display = 'none';

                }

            }

        },

        cancelId: '#cancelar-equipe'

    });

    const form = qs('#equipeForm');

    if (!form) return;

    const foto = qs('#foto', form);

    const preview = qs('#preview', form);

    if (foto && preview) {

        foto.addEventListener('change', () => {

            if (!foto.files.length) {

                preview.src = '';

                preview.style.display = 'none';

                return;

            }

            const reader = new FileReader();

            reader.onload = (e) => {

                preview.src = e.target.result;

                preview.style.display = 'block';

            };

            reader.readAsDataURL(foto.files[0]);

        });

    }

    const limparPreview = () => {

        if (!preview) return;

        preview.src = '';

        preview.style.display = 'none';

    };

    form.addEventListener('reset', () => {

        setTimeout(limparPreview, 0);

    });

    qs('#cancelar-equipe')?.addEventListener('click', limparPreview);

}


async function bindPaginas() {
  const form = qs('#form-pagina');
  if (!form) return;

  const select = qs('#slug-pagina');
  const title = qs('[name=titulo]', form);
  const content = qs('[name=conteudo]', form);
  const status = qs('#status-paginas');

  async function load() {
    try {
      const page = await request(`/paginas/${select.value}`);
      title.value = page.titulo || '';
      content.value = page.conteudo || '';
      setStatus(status, 'Pagina carregada.', 'muted');
    } catch (error) {
      setStatus(status, error.message, 'error');
    }
  }

  select.addEventListener('change', load);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, 'Salvando...', 'muted');

    try {
      await request(`/paginas/${select.value}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: title.value,
          conteudo: content.value
        })
      });
      setStatus(status, 'Pagina atualizada com sucesso.', 'success');
    } catch (error) {
      setStatus(status, error.message, 'error');
    }
  });

  load();
}

async function bindContatos() {
  const table = qs('#tbody-contatos');
  if (!table) return;

  async function refresh() {
    try {
      const items = await request('/contatos');
      table.innerHTML =
        items.map((item) => `
          <tr>
            <td>${escapeHtml(item.nome)}</td>
            <td><a class="link" href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></td>
            <td>${escapeHtml(item.mensagem)}</td>
            <td><span class="pill ${item.lido ? 'success' : 'warning'}">${item.lido ? 'Lida' : 'Nova'}</span></td>
            <td>
              <div class="toolbar row-actions">
                <button class="btn alt" data-read="${escapeHtml(item.id)}" type="button">Marcar lida</button>
                <button class="btn danger" data-del="${escapeHtml(item.id)}" type="button">Excluir</button>
              </div>
            </td>
          </tr>
        `).join('') || '<tr><td colspan="5">Nenhuma mensagem.</td></tr>';
    } catch (error) {
      table.innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
    }
  }

  table.addEventListener('click', async (event) => {
    const read = event.target.dataset.read;
    const del = event.target.dataset.del;

    if (read) {
      await request(`/contatos/${read}/lido`, { method: 'PUT' });
      refresh();
    }

    if (del && confirm('Excluir esta mensagem?')) {
      await request(`/contatos/${del}`, { method: 'DELETE' });
      refresh();
    }
  });

  refresh();
}

document.addEventListener('DOMContentLoaded', () => {
  ensureAuth();
  markCurrentNav();
  fillSidebar();

  bindAcoes();
  bindProjetos();
  bindGaleria();
  bindBanners();
  bindPaginas();
  bindContatos();
  bindPrestacao();
  loadDashboard();
  bindEquipe();

  qs('#logout-btn')?.addEventListener('click', (event) => {
    event.preventDefault();
    logout();
  });
  qs('#login-form')?.addEventListener('submit', doLogin);
});
