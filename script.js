document.addEventListener('DOMContentLoaded', () => {

  /* --- VARIÁVEIS E ESTADO --- */
  const LIMITE_FREE = 10;
  const apiKey = ""; // Mantido vazio conforme diretrizes
  
  let usuario = JSON.parse(localStorage.getItem('usuario'));
  let totalVistorias = parseInt(localStorage.getItem('totalVistorias')) || 0;
  let imagensSelecionadas = [];

  /* --- ELEMENTOS DOM --- */
  const elements = {
    navbar: document.querySelector('.custom-navbar'),
    navLoginTrigger: document.getElementById('navLoginTrigger'),
    navUsuario: document.getElementById('navUsuario'),
    navHistorico: document.getElementById('navHistorico'),
    navEmpresa: document.getElementById('navEmpresa'),
    navLogout: document.getElementById('navLogout'),
    navPlanoBadge: document.getElementById('navPlano'),
    planoNomeSpan: document.getElementById('planoNome'),
    
    // Modal e Login
    modalLogin: document.getElementById('modalLogin'),
    btnLoginAction: document.getElementById('btnLoginAction'),
    loginEmailInput: document.getElementById('loginEmail'),
    loginPassInput: document.getElementById('loginPassword'),
    btnCloseModal: document.querySelector('.btn-close-modal'),
    btnGoogleLogin: document.getElementById('btnGoogleLogin'),
    btnAppleLogin: document.getElementById('btnAppleLogin'),
    toggleLoginAction: document.getElementById('toggleLoginAction'), // "Criar conta" ou "Já tenho conta"
    
    // Vistoria Core
    fileBar: document.getElementById('fileBar'),
    fotoInput: document.getElementById('fotoInput'),
    preview: document.getElementById('previewFotos'),
    btnEnviar: document.getElementById('btnEnviar'),
    descricaoTxt: document.getElementById('descricaoResultado'),
    btnPdfPro: document.getElementById('btnPdfPro'),
    contadorSpan: document.getElementById('contadorVistorias'),
    secaoEmpresa: document.getElementById('empresa')
  };

  /* --- INICIALIZAÇÃO --- */
  atualizarInterfaceUsuario();
  atualizarContador();

  /* --- NAVBAR SCROLL EFFECT --- */
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!elements.navbar) return;
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) elements.navbar.classList.add('shrink');
    else elements.navbar.classList.remove('shrink');
    
    if (currentScroll > lastScrollY && currentScroll > 200) {
      elements.navbar.style.transform = 'translateY(-100%)';
    } else {
      elements.navbar.style.transform = 'translateY(0)';
    }
    lastScrollY = currentScroll;
  }, { passive: true });

  /* --- LÓGICA DO MENU DE LOGIN --- */
  
  // Abrir Modal
  elements.navLoginTrigger?.addEventListener('click', (e) => {
    e.preventDefault();
    elements.modalLogin?.classList.remove('d-none');
    elements.loginEmailInput?.focus();
  });

  // Fechar Modal
  elements.btnCloseModal?.addEventListener('click', () => {
    elements.modalLogin?.classList.add('d-none');
  });

  // Fechar ao clicar fora do card
  elements.modalLogin?.addEventListener('click', (e) => {
    if (e.target === elements.modalLogin) {
      elements.modalLogin.classList.add('d-none');
    }
  });

  // Função genérica de Login
  const realizarLogin = (email, tipo = 'email') => {
    if (!email || !email.includes('@')) {
      return alert('Por favor, insira um e-mail válido.');
    }

    // Lógica de plano baseada no e-mail (Simulação para testes)
    let plano = 'free';
    if (email.includes('pro')) plano = 'pro';
    if (email.includes('premium')) plano = 'premium';

    usuario = {
      email: email,
      plano: plano,
      uid: Math.random().toString(36).substr(2, 9),
      loginType: tipo,
      dataLogin: new Date().toISOString()
    };
    
    localStorage.setItem('usuario', JSON.stringify(usuario));
    elements.modalLogin?.classList.add('d-none');
    atualizarInterfaceUsuario();
    
    // Pequeno feedback no console
    console.log(`Logado como ${email} (${plano})`);
  };

  // Login via E-mail
  elements.btnLoginAction?.addEventListener('click', (e) => {
    e.preventDefault();
    const email = elements.loginEmailInput?.value;
    realizarLogin(email, 'email');
  });

  // Login Social (Google/Apple) - Simulação de delay de rede
  const handleSocialLogin = (provider) => {
    const btn = provider === 'google' ? elements.btnGoogleLogin : elements.btnAppleLogin;
    if (!btn) return;

    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Conectando...';

    setTimeout(() => {
      realizarLogin(`${provider}-user@vistoria.ia`, provider);
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }, 1200);
  };

  elements.btnGoogleLogin?.addEventListener('click', () => handleSocialLogin('google'));
  elements.btnAppleLogin?.addEventListener('click', () => handleSocialLogin('apple'));

  // Alternar entre Login e Cadastro (Simulação visual)
  elements.toggleLoginAction?.addEventListener('click', (e) => {
    e.preventDefault();
    const isLogin = elements.btnLoginAction.textContent === 'Entrar';
    const titulo = elements.modalLogin.querySelector('h3');
    
    if (isLogin) {
      titulo.textContent = 'Criar sua conta';
      elements.btnLoginAction.textContent = 'Cadastrar agora';
      elements.toggleLoginAction.textContent = 'Já tenho uma conta';
    } else {
      titulo.textContent = 'Entrar no VistorIA';
      elements.btnLoginAction.textContent = 'Entrar';
      elements.toggleLoginAction.textContent = 'Criar uma conta gratuita';
    }
  });

  // Logout
  elements.navLogout?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('usuario');
    usuario = null;
    atualizarInterfaceUsuario();
    // Feedback visual imediato antes do reload
    document.body.style.opacity = '0.5';
    window.location.reload();
  });

  /* --- ATUALIZAÇÃO DA UI --- */

  function atualizarInterfaceUsuario() {
    const logado = !!usuario;
    
    // Toggle visibilidade dos itens de conta
    if (elements.navLoginTrigger) elements.navLoginTrigger.classList.toggle('d-none', logado);
    if (elements.navLogout) elements.navLogout.classList.toggle('d-none', !logado);
    if (elements.navHistorico) elements.navHistorico.classList.toggle('d-none', !logado);
    
    // Atualiza nome de exibição (primeira parte do email)
    if (elements.navUsuario) {
        const toggle = elements.navUsuario.querySelector('.dropdown-toggle');
        if (logado) {
            toggle.textContent = usuario.email.split('@')[0];
        } else {
            toggle.textContent = 'Conta';
        }
    }

    // Badge do Plano
    if (elements.navPlanoBadge) {
      elements.navPlanoBadge.classList.toggle('d-none', !logado);
      if (logado && elements.planoNomeSpan) {
        elements.planoNomeSpan.textContent = usuario.plano.toUpperCase();
      }
    }

    // Permissões de Empresa (Apenas para Premium)
    const isPremium = logado && usuario.plano === 'premium';
    if (elements.navEmpresa) elements.navEmpresa.classList.toggle('d-none', !isPremium);
    if (elements.secaoEmpresa) elements.secaoEmpresa.classList.toggle('d-none', !isPremium);
  }

  function atualizarContador() {
    if (elements.contadorSpan) {
      const restantes = Math.max(0, LIMITE_FREE - totalVistorias);
      elements.contadorSpan.textContent = restantes;
      elements.contadorSpan.className = restantes < 3 ? 'fw-bold text-danger' : 'fw-bold text-primary';
    }
  }

  /* --- UPLOAD E PREVIEW --- */
  elements.fileBar?.addEventListener('click', () => elements.fotoInput?.click());

  elements.fotoInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        imagensSelecionadas.push(file);
      }
    });
    renderizarPreview();
    elements.fotoInput.value = ''; 
  });

  function renderizarPreview() {
    if (!elements.preview) return;
    elements.preview.innerHTML = '';
    
    imagensSelecionadas.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <div class="preview-remove" title="Remover">&times;</div>
        `;
        div.querySelector('.preview-remove').onclick = (evt) => {
           evt.stopPropagation(); 
           imagensSelecionadas.splice(index, 1);
           renderizarPreview();
        };
        elements.preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
    
    const h5 = elements.fileBar?.querySelector('h5');
    if (h5) {
      h5.textContent = imagensSelecionadas.length > 0 
        ? `${imagensSelecionadas.length} foto(s) selecionada(s)` 
        : 'Clique para enviar fotos';
    }
  }

  /* --- SIMULAÇÃO DE IA --- */
  elements.btnEnviar?.addEventListener('click', async () => {
    if (!usuario) {
      elements.modalLogin?.classList.remove('d-none');
      return;
    }
    if (imagensSelecionadas.length === 0) {
      return alert('Adicione pelo menos uma foto para análise.');
    }

    const btnOriginal = elements.btnEnviar.innerHTML;
    elements.btnEnviar.disabled = true;
    elements.btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processando Inteligência...';

    setTimeout(() => {
      const mockResult = "LAUDO DE VISTORIA IA\n" +
                         "-------------------\n" +
                         "- Ambiente: Sala de Estar\n" +
                         "- Piso: Laminado madeira, estado excelente.\n" +
                         "- Paredes: Pintura látex gelo, marcas de quadros removidos.\n" +
                         "- Esquadrias: Janela de alumínio, vedação íntegra.\n" +
                         "- Elétrica: Espelhos de tomada padrão novo, sem avarias.";
      
      if (elements.descricaoTxt) {
        elements.descricaoTxt.value = mockResult;
        elements.descricaoTxt.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      elements.btnEnviar.innerHTML = btnOriginal;
      elements.btnEnviar.disabled = false;
    }, 1800);
  });

  /* --- GERAÇÃO DE PDF --- */
  elements.btnPdfPro?.addEventListener('click', () => {
    if (!usuario) {
      elements.modalLogin?.classList.remove('d-none');
      return;
    }
    
    if (usuario.plano === 'free' && totalVistorias >= LIMITE_FREE) {
      alert('Você atingiu o limite do plano gratuito.');
      document.getElementById('aba-planos')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const originalText = elements.btnPdfPro.innerHTML;
    elements.btnPdfPro.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    elements.btnPdfPro.disabled = true;

    setTimeout(() => {
      alert('PDF Gerado com sucesso! Iniciando download...');
      totalVistorias++;
      localStorage.setItem('totalVistorias', totalVistorias);
      atualizarContador();
      elements.btnPdfPro.innerHTML = originalText;
      elements.btnPdfPro.disabled = false;
    }, 1500);
  });
});
