// ATENÇÃO: SUBSTITUA COM A URL DO SEU BACKEND (EX: "http://localhost:3000/api" ou "https://seu-app-render.onrender.com/api")
const API_BASE = "http://localhost:5000/api";

// --- Referências de Elementos HTML ---
const formLogin = document.getElementById("formLogin");
const loginSection = document.getElementById("loginSection");

const painelSection = document.getElementById("painelSection");
const usuarioLogadoSpan = document.getElementById("usuarioLogado");
const btnLogout = document.getElementById("btnLogout");

// Seção de Gerenciamento de Usuários (Admin)
const usuariosSection = document.getElementById("usuariosSection");
const formCadastroUsuario = document.getElementById("formCadastroUsuario");
const roleUsuarioSelect = document.getElementById("roleUsuario"); // Para o cadastro de usuário

// Clientes
const listaClientes = document.getElementById("listaClientes");
const btnMostrarCadastroCliente = document.getElementById("btnMostrarCadastroCliente");
const cadastroClienteModal = document.getElementById("cadastroClienteModal");
const tituloFormCliente = document.getElementById("tituloFormCliente");
const formCadastroCliente = document.getElementById("formCadastroCliente");
const clienteIdEdit = document.getElementById("clienteIdEdit"); // Campo oculto para ID em edição
const nome_clienteInput = document.getElementById("nome_cliente");
const cpf_cnpjInput = document.getElementById("cpf_cnpj");
const telefoneInput = document.getElementById("telefone");
const emailInput = document.getElementById("email");
const enderecoInput = document.getElementById("endereco");
const btnSalvarCliente = document.getElementById("btnSalvarCliente");

// Filtros de Clientes
const filtroNomeCliente = document.getElementById("filtroNomeCliente");
const filtroCpfCnpjCliente = document.getElementById("filtroCpfCnpjCliente");
const filtroEmailCliente = document.getElementById("filtroEmailCliente");
const filtroTelefoneCliente = document.getElementById("filtroTelefoneCliente");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");


// Vendas
const listaVendasGlobal = document.getElementById("listaVendasGlobal");
const btnMostrarCadastroVenda = document.getElementById("btnMostrarCadastroVenda");
const cadastroVendaModal = document.getElementById("cadastroVendaModal");
const tituloFormVenda = document.getElementById("tituloFormVenda");
const formCadastroVenda = document.getElementById("formCadastroVenda");
const vendaIdEdit = document.getElementById("vendaIdEdit"); // Campo oculto para ID de venda em edição
const vendaClienteIdSelect = document.getElementById("vendaClienteId"); // Select para associar cliente à venda
const valor_total_vendaInput = document.getElementById("valor_total_venda");
const valor_pago_vendaInput = document.getElementById("valor_pago_venda");
const data_vencimento_vendaInput = document.getElementById("data_vencimento_venda");
const forma_pagamento_vendaSelect = document.getElementById("forma_pagamento_venda");
const observacoes_vendaInput = document.getElementById("observacoes_venda");
const btnSalvarVenda = document.getElementById("btnSalvarVenda");

// Filtros de Vendas
const filtroTermoVenda = document.getElementById("filtroTermoVenda");
const filtroStatusVenda = document.getElementById("filtroStatusVenda");
const filtroDataInicioVenda = document.getElementById("filtroDataInicioVenda");
const filtroDataFimVenda = document.getElementById("filtroDataFimVenda");
const btnLimparFiltrosVenda = document.getElementById("btnLimparFiltrosVenda");


// Modal de Pagamento
const pagamentoModal = document.getElementById("pagamentoModal");
const pagamentoVendaIdSpan = document.getElementById("pagamentoVendaId");
const pagamentoVendaTotalSpan = document.getElementById("pagamentoVendaTotal");
const pagamentoVendaPagoSpan = document.getElementById("pagamentoVendaPago");
const pagamentoVendaDevidoSpan = document.getElementById("pagamentoVendaDevido");
const formPagamento = document.getElementById("formPagamento");
const pagamentoVendaHiddenId = document.getElementById("pagamentoVendaHiddenId");
const valorPagamentoInput = document.getElementById("valorPagamento");
const formaPagamentoPagamentoSelect = document.getElementById("formaPagamentoPagamento");
const observacoesPagamentoInput = document.getElementById("observacoesPagamento");

// Modal de Vendas por Cliente (extrato)
const vendasClienteModal = document.getElementById("vendasClienteModal");
const vendasClienteNomeSpan = document.getElementById("vendasClienteNome");
const listaVendasCliente = document.getElementById("listaVendasCliente");


// --- Variáveis de Estado Global ---
let userRole = null; // Para armazenar o papel do usuário logado

// --- Funções de Utilitário ---
function getToken() {
  return localStorage.getItem("token");
}

function getUserInfo() {
  // Retorna o objeto JSON do usuário
  const userInfo = localStorage.getItem("user");
  return userInfo ? JSON.parse(userInfo) : null;
}

function hasPermission(requiredRoles) {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

function formatCurrency(value) {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}


// --- Funções de Exibição de UI ---
function mostrarPainel() {
  loginSection.style.display = "none";
  painelSection.style.display = "block";
  const userInfo = getUserInfo();
  if (userInfo) {
    usuarioLogadoSpan.textContent = `Olá, ${userInfo.nome}! (${userInfo.role.toUpperCase()})`;
    userRole = userInfo.role; // Define a role global
    aplicarPermissoesUI(); // Aplica as permissões na UI
  }
}

function mostrarLogin() {
  loginSection.style.display = "block";
  painelSection.style.display = "none";
  userRole = null; // Limpa a role ao sair
}

function aplicarPermissoesUI() {
  // Gerenciar Seção de Usuários
  if (hasPermission(['admin'])) {
    usuariosSection.style.display = "block";
  } else {
    usuariosSection.style.display = "none";
  }

  // Clientes: Botões de Editar/Excluir
  // Isso será tratado dinamicamente na função renderizarCliente

  // Vendas: Botões de Editar/Excluir
  // Isso será tratado dinamicamente na função renderizarVenda
}

// --- Funções de Modal ---
function abrirModalCadastroCliente(cliente = null) {
  formCadastroCliente.reset();
  clienteIdEdit.value = "";
  if (cliente) {
    tituloFormCliente.textContent = "Editar Cliente";
    clienteIdEdit.value = cliente.id;
    nome_clienteInput.value = cliente.nome_cliente;
    cpf_cnpjInput.value = cliente.cpf_cnpj || '';
    telefoneInput.value = cliente.telefone || '';
    emailInput.value = cliente.email || '';
    enderecoInput.value = cliente.endereco || '';
    btnSalvarCliente.textContent = "Atualizar Cliente";
  } else {
    tituloFormCliente.textContent = "Cadastrar Novo Cliente";
    btnSalvarCliente.textContent = "Cadastrar Cliente";
  }
  cadastroClienteModal.style.display = "block";
}

function fecharModalCadastroCliente() {
  cadastroClienteModal.style.display = "none";
}

async function abrirModalCadastroVenda(venda = null) {
  formCadastroVenda.reset();
  vendaIdEdit.value = "";
  // Popula o select de clientes para associar a venda
  await popularSelectClientesVenda();

  if (venda) {
    tituloFormVenda.textContent = "Editar Venda";
    vendaIdEdit.value = venda.id;
    vendaClienteIdSelect.value = venda.cliente_id;
    valor_total_vendaInput.value = venda.valor_total;
    valor_pago_vendaInput.value = venda.valor_pago;
    data_vencimento_vendaInput.value = venda.data_vencimento ? formatDate(venda.data_vencimento).split('/').reverse().join('-') : ''; // Formata para YYYY-MM-DD
    forma_pagamento_vendaSelect.value = venda.forma_pagamento;
    observacoes_vendaInput.value = venda.observacoes_venda || '';
    btnSalvarVenda.textContent = "Atualizar Venda";
  } else {
    tituloFormVenda.textContent = "Registrar Nova Venda";
    btnSalvarVenda.textContent = "Registrar Venda";
  }
  cadastroVendaModal.style.display = "block";
}

function fecharModalCadastroVenda() {
  cadastroVendaModal.style.display = "none";
}

function abrirModalPagamento(venda) {
  pagamentoVendaHiddenId.value = venda.id;
  pagamentoVendaIdSpan.textContent = venda.id;
  pagamentoVendaTotalSpan.textContent = formatCurrency(venda.valor_total);
  pagamentoVendaPagoSpan.textContent = formatCurrency(venda.valor_pago);
  pagamentoVendaDevidoSpan.textContent = formatCurrency(venda.valor_devido);
  valorPagamentoInput.value = ''; // Limpa o campo de valor
  formaPagamentoPagamentoSelect.value = 'Dinheiro';
  observacoesPagamentoInput.value = '';
  pagamentoModal.style.display = "block";
}

function fecharModalPagamento() {
  pagamentoModal.style.display = "none";
}

function abrirModalVendasCliente(cliente) {
    vendasClienteNomeSpan.textContent = cliente.nome_cliente;
    listarVendasPorCliente(cliente.id);
    vendasClienteModal.style.display = "block";
}

function fecharModalVendasCliente() {
    vendasClienteModal.style.display = "none";
}


// --- Funções de Requisição ao Backend ---

// Autenticação
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailLogin").value;
  const senha = document.getElementById("senhaLogin").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.usuario)); // Salva info do user
      mostrarPainel();
      buscarClientes(); // Carrega clientes após login
      buscarVendas();   // Carrega vendas após login
    } else {
      alert("Erro ao fazer login: " + (data.erro || "Verifique suas credenciais."));
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
    alert("Erro de conexão com o servidor. Tente novamente mais tarde.");
  }
});

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  mostrarLogin();
  listaClientes.innerHTML = ""; // Limpa a lista
  listaVendasGlobal.innerHTML = ""; // Limpa a lista de vendas
});

// Cadastro de Novo Usuário (Admin apenas)
formCadastroUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) { alert("Você precisa estar logado."); return; }
  if (!hasPermission(['admin'])) { alert("Você não tem permissão para cadastrar usuários."); return; }

  const newUser = {
    nome: document.getElementById("nomeUsuario").value,
    email: document.getElementById("emailUsuario").value,
    senha: document.getElementById("senhaUsuario").value,
    role: roleUsuarioSelect.value,
  };

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Usuário cadastrado com sucesso!");
      formCadastroUsuario.reset();
    } else {
      alert("Erro ao cadastrar usuário: " + (data.erro || data.msg));
    }
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    alert("Erro de conexão ao cadastrar usuário.");
  }
});


// CLIENTES

// Lidar com o envio do formulário de cliente (cadastro ou edição)
formCadastroCliente.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) { alert("Você precisa estar logado."); return; }

  const clienteData = {
    nome_cliente: nome_clienteInput.value,
    cpf_cnpj: cpf_cnpjInput.value.replace(/\D/g, ''), // Apenas números
    telefone: telefoneInput.value,
    email: emailInput.value,
    endereco: enderecoInput.value,
  };

  const clienteId = clienteIdEdit.value;
  let url = `${API_BASE}/clientes`;
  let method = "POST";

  if (clienteId) { // Se tem ID, é edição (PUT)
    url = `${API_BASE}/clientes/${clienteId}`;
    method = "PUT";
    if (!hasPermission(['admin', 'gerente'])) { alert("Você não tem permissão para editar clientes."); return; }
  } else { // Senão, é cadastro (POST)
    if (!hasPermission(['admin', 'gerente', 'vendedor'])) { alert("Você não tem permissão para cadastrar clientes."); return; }
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(clienteData),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Cliente ${clienteId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      fecharModalCadastroCliente();
      buscarClientes(); // Recarrega a lista
    } else {
      alert(`Erro ao ${clienteId ? 'atualizar' : 'cadastrar'} cliente: ` + (data.erro || data.msg));
    }
  } catch (error) {
    console.error(`Erro na operação de cliente (${method}):`, error);
    alert("Erro de conexão ao operar cliente.");
  }
});

// Abre o modal de cadastro de cliente
btnMostrarCadastroCliente.addEventListener("click", () => abrirModalCadastroCliente());


// Buscar e exibir clientes (com filtros)
async function buscarClientes() {
  const token = getToken();
  if (!token) return;

  const termo = filtroNomeCliente.value.trim();
  const cpf_cnpj = filtroCpfCnpjCliente.value.trim();
  const email = filtroEmailCliente.value.trim();
  const telefone = filtroTelefoneCliente.value.trim();

  const queryParams = new URLSearchParams();
  if (termo) queryParams.append('termo', termo);
  if (cpf_cnpj) queryParams.append('cpf_cnpj', cpf_cnpj);
  if (email) queryParams.append('email', email);
  if (telefone) queryParams.append('telefone', telefone);

  const url = `${API_BASE}/clientes?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      listaClientes.innerHTML = "";
      if (data.length === 0) {
        listaClientes.innerHTML = "<li>Nenhum cliente encontrado.</li>";
        return;
      }
      data.forEach((cliente) => renderizarCliente(cliente));
    } else {
      alert("Erro ao buscar clientes: " + (data.erro || data.msg));
    }
  } catch (error) {
    console.error("Erro de conexão ao buscar clientes:", error);
    alert("Erro de conexão ao buscar clientes.");
  }
}

// Renderiza um cliente na lista
function renderizarCliente(cliente) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span><strong>Nome:</strong> ${cliente.nome_cliente}</span>
    <span><strong>CPF/CNPJ:</strong> ${cliente.cpf_cnpj || 'N/A'}</span>
    <span><strong>Telefone:</strong> ${cliente.telefone || 'N/A'}</span>
    <span><strong>Email:</strong> ${cliente.email || 'N/A'}</span>
    <span><strong>Endereço:</strong> ${cliente.endereco || 'N/A'}</span>
    <div class="actions">
      <button class="btn-primary" onclick="abrirModalVendasCliente(${cliente.id})">Ver Vendas</button>
      ${hasPermission(['admin', 'gerente']) ? `<button class="btn-secondary" onclick="editarCliente(${cliente.id})">Editar</button>` : ''}
      ${hasPermission(['admin']) ? `<button class="btn-danger" onclick="deletarCliente(${cliente.id})">Excluir</button>` : ''}
    </div>
  `;
  listaClientes.appendChild(li);
}

// Chamar edição
async function editarCliente(id) {
  const token = getToken();
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/clientes?id=${id}`, { // Buscar cliente específico (se listarClientes já faz isso)
        headers: { Authorization: `Bearer ${token}` },
    });
    const clientes = await response.json(); // listarClientes retorna um array
    const cliente = clientes.find(c => c.id === id); // Encontrar o cliente pelo ID

    if (response.ok && cliente) {
        abrirModalCadastroCliente(cliente);
    } else {
        alert("Erro ao buscar cliente para edição: " + (clientes.erro || clientes.msg));
    }
  } catch (error) {
    console.error("Erro ao buscar cliente para edição:", error);
    alert("Erro de conexão ao buscar cliente para edição.");
  }
}


// Deletar Cliente
async function deletarCliente(id) {
  if (!confirm("Tem certeza que deseja excluir este cliente? Todas as vendas associadas também serão excluídas!")) return;
  const token = getToken();
  if (!token) { alert("Você precisa estar logado."); return; }
  if (!hasPermission(['admin'])) { alert("Você não tem permissão para excluir clientes."); return; }

  try {
    const response = await fetch(`${API_BASE}/clientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Cliente excluído com sucesso!");
      buscarClientes();
    } else {
      const data = await response.json();
      alert("Erro ao excluir cliente: " + (data.erro || data.msg));
    }
  } catch (error) {
    console.error("Erro de conexão ao excluir cliente:", error);
    alert("Erro de conexão ao excluir cliente.");
  }
}

// Listeners para os filtros de cliente
filtroNomeCliente.addEventListener('input', buscarClientes);
filtroCpfCnpjCliente.addEventListener('input', buscarClientes);
filtroEmailCliente.addEventListener('input', buscarClientes);
filtroTelefoneCliente.addEventListener('input', buscarClientes);
btnLimparFiltros.addEventListener('click', () => {
    filtroNomeCliente.value = '';
    filtroCpfCnpjCliente.value = '';
    filtroEmailCliente.value = '';
    filtroTelefoneCliente.value = '';
    buscarClientes();
});


// VENDAS

// Popula o select de clientes para o formulário de venda
async function popularSelectClientesVenda() {
  const token = getToken();
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/clientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const clientes = await response.json();
    vendaClienteIdSelect.innerHTML = '<option value="">Selecione um Cliente</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = cliente.nome_cliente;
      vendaClienteIdSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao popular clientes para venda:", error);
    alert("Erro ao carregar lista de clientes para vendas.");
  }
}

// Lidar com o envio do formulário de venda (cadastro ou edição)
formCadastroVenda.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = getToken();
  if (!token) { alert("Você precisa estar logado."); return; }

  const vendaData = {
    cliente_id: parseInt(vendaClienteIdSelect.value),
    valor_total: parseFloat(valor_total_vendaInput.value),
    valor_pago: parseFloat(valor_pago_vendaInput.value),
    data_vencimento: data_vencimento_vendaInput.value || null,
    forma_pagamento: forma_pagamento_vendaSelect.value,
    observacoes_venda: observacoes_vendaInput.value,
  };

  const vendaId = vendaIdEdit.value;
  let url = `${API_BASE}/vendas`;
  let method = "POST";

  if (vendaId) { // Se tem ID, é edição (PUT)
    url = `${API_BASE}/vendas/${vendaId}`;
    method = "PUT";
    if (!hasPermission(['admin', 'gerente'])) { alert("Você não tem permissão para editar vendas."); return; }
  } else { // Senão, é cadastro (POST)
    if (!hasPermission(['admin', 'gerente', 'vendedor'])) { alert("Você não tem permissão para cadastrar vendas."); return; }
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vendaData),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Venda ${vendaId ? 'atualizada' : 'registrada'} com sucesso!`);
      fecharModalCadastroVenda();
      buscarVendas(); // Recarrega a lista global de vendas
      if (vendasClienteModal.style.display === "block") { // Se estiver no modal de vendas por cliente
          listarVendasPorCliente(vendaData.cliente_id); // Recarrega a lista específica também
      }
    } else {
      alert(`Erro ao ${vendaId ? 'atualizar' : 'registrar'} venda: ` + (data.erro || data.msg));
    }
  } catch (error) {
    console.error(`Erro na operação de venda (${method}):`, error);
    alert("Erro de conexão ao operar venda.");
  }
});

// Abre o modal de cadastro de venda
btnMostrarCadastroVenda.addEventListener("click", () => abrirModalCadastroVenda());


// Buscar e exibir vendas (com filtros)
async function buscarVendas() {
  const token = getToken();
  if (!token) return;

  const clienteId = null; // Não filtrar por cliente específico aqui, essa é a lista global
  const status = filtroStatusVenda.value;
  const dataInicio = filtroDataInicioVenda.value;
  const dataFim = filtroDataFimVenda.value;
  const termoCliente = filtroTermoVenda.value.trim();


  const queryParams = new URLSearchParams();
  if (clienteId) queryParams.append('clienteId', clienteId);
  if (status) queryParams.append('status', status);
  if (dataInicio) queryParams.append('dataInicio', dataInicio);
  if (dataFim) queryParams.append('dataFim', dataFim);
  if (termoCliente) queryParams.append('termoCliente', termoCliente);


  const url = `${API_BASE}/vendas?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      listaVendasGlobal.innerHTML = "";
      if (data.length === 0) {
        listaVendasGlobal.innerHTML = "<li>Nenhuma venda encontrada.</li>";
        return;
      }
      data.forEach((venda) => renderizarVenda(venda, listaVendasGlobal));
    } else {
      alert("Erro ao buscar vendas: " + (data.erro || data.msg));
    }
  } catch (error) {
    console.error("Erro de conexão ao buscar vendas:", error);
    alert("Erro de conexão ao buscar vendas.");
  }
}

// Renderiza uma venda na lista
function renderizarVenda(venda, listaElement) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span><strong>ID Venda:</strong> ${venda.id}</span>
    <span><strong>Cliente:</strong> ${venda.nome_cliente || 'N/A'}</span>
    <span><strong>Valor Total:</strong> ${formatCurrency(venda.valor_total)}</span>
    <span><strong>Valor Pago:</strong> ${formatCurrency(venda.valor_pago)}</span>
    <span><strong>Valor Devido:</strong> ${formatCurrency(venda.valor_devido)}</span>
    <span><strong>Status:</strong> ${venda.status_venda}</span>
    <span><strong>Data Venda:</strong> ${formatDate(venda.data_venda)}</span>
    <span><strong>Vencimento:</strong> ${formatDate(venda.data_vencimento)}</span>
    <span><strong>Forma Pgto:</strong> ${venda.forma_pagamento || 'N/A'}</span>
    <span><strong>Obs:</strong> ${venda.observacoes_venda || 'N/A'}</span>
    <div class="actions">
      ${venda.status_venda !== 'Paga' && hasPermission(['admin', 'gerente', 'vendedor']) ? `<button class="btn-primary" onclick="abrirModalPagamento(${venda.id})">Registrar Pgto</button>` : ''}
      ${hasPermission(['admin', 'gerente']) ? `<button class="btn-secondary" onclick="editarVenda(${venda.id})">Editar</button>` : ''}
      ${hasPermission(['admin']) ? `<button class="btn-danger" onclick="deletarVenda(${venda.id})">Excluir</button>` : ''}
    </div>
  `;
  listaElement.appendChild(li);
}

// Chamar edição de venda
async function editarVenda(id) {
  const token = getToken();
  if (!token) return;
  try {
    const response = await fetch(`${API_BASE}/vendas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const venda = await response.json();
    if (response.ok && venda) {
        abrirModalCadastroVenda(venda);
    } else {
        alert("Erro ao buscar venda para edição: " + (venda.erro || venda.msg));
    }
  } catch (error) {
    console.error("Erro ao buscar venda para edição:", error);
    alert("Erro de conexão ao buscar venda para edição.");
  }
}

// Deletar Venda
async function deletarVenda(id) {
  if (!confirm("Tem certeza que deseja excluir esta venda?")) return;
  const token = getToken();
  if (!token) { alert("Você precisa estar logado."); return; }
  if (!hasPermission(['admin'])) { alert("Você não tem permissão para excluir vendas."); return; }

  try {
    const response = await fetch(`${API_BASE}/vendas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Venda excluída com sucesso!");
      buscarVendas(); // Recarrega a lista global
      if (vendasClienteModal.style.display === "block") { // Se estiver no modal de vendas por cliente
          const clienteId = document.getElementById("vendasClienteNome").dataset.clienteId; // Precisa de um jeito de pegar o clienteId aqui
          if (clienteId) listarVendasPorCliente(clienteId); // Recarrega a lista específica
      }
    } else {
      const data = await response.json();
      alert("Erro ao excluir venda: " + (data.erro || data.msg));
    }
  } catch (error) {
    console.error("Erro de conexão ao excluir venda:", error);
    alert("Erro de conexão ao excluir venda.");
  }
}

// Listener para registrar pagamento
formPagamento.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { alert("Você precisa estar logado."); return; }
    if (!hasPermission(['admin', 'gerente', 'vendedor'])) { alert("Você não tem permissão para registrar pagamentos."); return; }

    const vendaId = pagamentoVendaHiddenId.value;
    const valorPagamento = parseFloat(valorPagamentoInput.value);
    const formaPagamento = formaPagamentoPagamentoSelect.value;
    const observacoes = observacoesPagamentoInput.value;

    try {
        const response = await fetch(`${API_BASE}/vendas/${vendaId}/pagar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ valor_pagamento: valorPagamento, forma_pagamento_pagamento: formaPagamento, observacoes_pagamento: observacoes }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Pagamento registrado com sucesso!");
            fecharModalPagamento();
            buscarVendas(); // Recarrega a lista global
            if (vendasClienteModal.style.display === "block") {
                // Ao registrar pagamento do modal de extrato do cliente, precisamos recarregar o extrato
                // Um pouco complicado sem o clienteId no momento, mas idealmente seria:
                // listarVendasPorCliente(clienteIdAtualDoModal);
                // Por agora, vamos apenas recarregar a lista global ou fazer um fetch da venda novamente.
                const currentVendaIdInModal = pagamentoVendaHiddenId.value;
                const clienteIdParaExtrato = await getClienteIdFromVenda(currentVendaIdInModal);
                if(clienteIdParaExtrato) listarVendasPorCliente(clienteIdParaExtrato);
            }
        } else {
            alert("Erro ao registrar pagamento: " + (data.erro || data.msg));
        }
    } catch (error) {
        console.error("Erro ao registrar pagamento:", error);
        alert("Erro de conexão ao registrar pagamento.");
    }
});

// Helper para obter clienteId de uma venda (usado após registrar pagamento)
async function getClienteIdFromVenda(vendaId) {
    const token = getToken();
    if (!token) return null;
    try {
        const response = await fetch(`${API_BASE}/vendas/${vendaId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data) {
            return data.cliente_id;
        }
    } catch (error) {
        console.error("Erro ao buscar clienteId da venda:", error);
    }
    return null;
}


// Listar vendas de um cliente específico (para o modal de extrato)
async function listarVendasPorCliente(clienteId) {
    const token = getToken();
    if (!token) return;
    listaVendasCliente.innerHTML = '<li>Carregando vendas...</li>';

    try {
        const response = await fetch(`${API_BASE}/vendas/cliente/${clienteId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
            listaVendasCliente.innerHTML = "";
            if (data.length === 0) {
                listaVendasCliente.innerHTML = "<li>Nenhuma venda encontrada para este cliente.</li>";
                return;
            }
            data.forEach((venda) => renderizarVenda(venda, listaVendasCliente));
        } else {
            alert("Erro ao buscar vendas do cliente: " + (data.erro || data.msg));
        }
    } catch (error) {
        console.error("Erro de conexão ao buscar vendas do cliente:", error);
        alert("Erro de conexão ao buscar vendas do cliente.");
    }
}


// Listeners para os filtros de venda
filtroTermoVenda.addEventListener('input', buscarVendas);
filtroStatusVenda.addEventListener('change', buscarVendas);
filtroDataInicioVenda.addEventListener('change', buscarVendas);
filtroDataFimVenda.addEventListener('change', buscarVendas);
btnLimparFiltrosVenda.addEventListener('click', () => {
    filtroTermoVenda.value = '';
    filtroStatusVenda.value = '';
    filtroDataInicioVenda.value = '';
    filtroDataFimVenda.value = '';
    buscarVendas();
});


// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  const token = getToken();
  if (token) {
    mostrarPainel();
    buscarClientes();
    buscarVendas(); // Carrega vendas globais ao iniciar
  } else {
    mostrarLogin();
  }
});