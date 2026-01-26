const navbar = document.querySelector('.custom-navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;


  // ENCOLHE
  if (currentScroll > 80) {
    navbar.classList.add('shrink');
  } else {
    navbar.classList.remove('shrink');
  }

  // ESCONDE / MOSTRA
  if (currentScroll > lastScrollY && currentScroll > 120) {
    navbar.classList.add('hide');
  } else {
    navbar.classList.remove('hide');
  }

  lastScrollY = currentScroll;
});

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     CONFIGURAÇÃO GLOBAL
  ===================================================== */
  const LIMITE_FREE = 10;

  let totalVistorias =
    JSON.parse(localStorage.getItem('totalVistorias')) || 0;

  let historicoVistorias =
    JSON.parse(localStorage.getItem('historico')) || [];

  const usuario =
    JSON.parse(localStorage.getItem('usuario'));

  const planoUsuario = usuario?.plano || 'free';


  /* =====================================================
     FUNÇÃO CENTRAL — LOGIN
  ===================================================== */
  function exigirLogin() {
    const abaLogin = document.getElementById('aba-login');

    if (abaLogin) {
      abaLogin.classList.remove('d-none');
      window.location.hash = 'aba-login';
    } else {
      alert('Faça login para continuar.');
    }
    return false;
  }

  function exigirUpgrade() {
    alert('Este recurso está disponível apenas em planos pagos.');
    const abaPlanos = document.getElementById('aba-planos');
    abaPlanos?.scrollIntoView({ behavior: 'smooth' });
    return false;
  }


  /* =====================================================
     LOGIN (HANDLER)
  ===================================================== */
  const btnLogin = document.getElementById('btnLogin');
  const loginEmail = document.getElementById('loginEmail');

  if (btnLogin && loginEmail) {
    btnLogin.addEventListener('click', () => {
      if (!loginEmail.value) {
        alert('Digite um e-mail válido');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify({
        email: loginEmail.value,
        plano: 'free',
        limite: LIMITE_FREE,
        usadas: 0
      }));

      alert('Login realizado com sucesso!');
      location.reload();
    });
  }


  /* =====================================================
     NAVBAR DINÂMICA
  ===================================================== */
  const navLogin = document.getElementById('navLogin');
  const navHistorico = document.getElementById('navHistorico');
  const navEmpresa = document.getElementById('navEmpresa');
  const navLogout = document.getElementById('navLogout');

  const secaoEmpresa = document.getElementById('empresa');
  const secaoHistorico = document.getElementById('historico');

  if (!usuario) {
    navLogin?.classList.remove('d-none');
    navHistorico?.classList.add('d-none');
    navEmpresa?.classList.add('d-none');
    navLogout?.classList.add('d-none');

    secaoEmpresa?.classList.add('d-none');
    secaoHistorico?.classList.add('d-none');
  } else {
    navLogin?.classList.add('d-none');
    navHistorico?.classList.remove('d-none');
    navLogout?.classList.remove('d-none');

    if (planoUsuario === 'premium') {
      navEmpresa?.classList.remove('d-none');
      secaoEmpresa?.classList.remove('d-none');
    } else {
      navEmpresa?.classList.add('d-none');
      secaoEmpresa?.classList.add('d-none');
    }

    navLogout?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('usuario');
      alert('Você saiu da conta');
      location.reload();
    });
  }


  /* =====================================================
     ELEMENTOS DO DOM
  ===================================================== */
  const fotoInput = document.getElementById('fotoInput');
  const fileBar = document.getElementById('fileBar');
  const preview = document.getElementById('previewFotos');
  const btnEnviar = document.getElementById('btnEnviar');
  const descricao = document.getElementById('descricaoResultado');
  const btnPdfPro = document.getElementById('btnPdfPro');
  const modeloRelatorio = document.getElementById('modeloRelatorio');
  const enderecoImovel = document.getElementById('enderecoImovel');

  let imagensSelecionadas = [];


  /* =====================================================
     UPLOAD DE FOTOS (COM BLOQUEIO)
  ===================================================== */
  fileBar?.addEventListener('click', () => {
    if (!usuario) return exigirLogin();
    fotoInput.click();
  });

  fotoInput?.addEventListener('change', () => {
    Array.from(fotoInput.files).forEach(file => {
      if (file.type.startsWith('image/')) {
        imagensSelecionadas.push(file);
      }
    });
    fotoInput.value = '';
    atualizarBarra();
    renderizarPreview();
  });


  function atualizarBarra() {
    if (!fileBar) return;
    const total = imagensSelecionadas.length;
    fileBar.textContent =
      total === 0
        ? 'Nenhuma foto selecionada'
        : total === 1
          ? '1 foto selecionada'
          : `${total} fotos selecionadas`;
  }

  function renderizarPreview() {
    if (!preview) return;
    preview.innerHTML = '';

    imagensSelecionadas.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
          <img src="${e.target.result}">
          <div class="preview-remove">&times;</div>
        `;
        div.querySelector('.preview-remove').onclick = () => {
          imagensSelecionadas.splice(index, 1);
          atualizarBarra();
          renderizarPreview();
        };
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
  }


  /* =====================================================
     GERAR DESCRIÇÃO (SIMULA IA)
  ===================================================== */
  btnEnviar?.addEventListener('click', () => {
    if (!usuario) return exigirLogin();
    if (!imagensSelecionadas.length) {
      alert('Adicione ao menos uma foto.');
      return;
    }

    btnEnviar.disabled = true;
    btnEnviar.innerHTML = 'Analisando...';

    setTimeout(() => {
      descricao.value =
        'Ambiente em bom estado geral, com paredes pintadas e boa iluminação.';
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = 'Enviar para análise';
    }, 2000);
  });


  /* =====================================================
     PDF + LIMITE FREE
  ===================================================== */
  btnPdfPro?.addEventListener('click', async () => {

    if (!usuario) return exigirLogin();

    if (planoUsuario === 'free' && totalVistorias >= LIMITE_FREE) {
      return exigirUpgrade();
    }

    totalVistorias++;
    localStorage.setItem('totalVistorias', totalVistorias);

    alert('PDF gerado (demo)');
  });

});
