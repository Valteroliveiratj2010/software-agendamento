const express = require("express");
const router = express.Router();
const controller = require("../controllers/clientesController");
// Importe ambos os módulos de autenticação/autorização
const { autenticarToken, autorizarPapeis } = require("../middleware/auth");

// Rotas para clientes:
// Listar clientes (agora com busca opcional por termo)
router.get("/", autenticarToken, controller.listarClientes);
// Pesquisar clientes (rota alternativa se preferir separar a busca, mas listarClientes já faz isso)
// router.get("/pesquisar", autenticarToken, controller.pesquisarClientes); // Descomente se quiser rota separada

// Criar cliente (apenas admin, gerente, vendedor podem criar)
router.post("/", autenticarToken, autorizarPapeis(['admin', 'gerente', 'vendedor']), controller.criarCliente);
// Atualizar cliente (apenas admin e gerente podem atualizar)
router.put("/:id", autenticarToken, autorizarPapeis(['admin', 'gerente']), controller.atualizarCliente);
// Deletar cliente (apenas admin pode deletar)
router.delete("/:id", autenticarToken, autorizarPapeis(['admin']), controller.deletarCliente);

module.exports = router;