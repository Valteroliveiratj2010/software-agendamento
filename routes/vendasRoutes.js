const express = require("express");
const router = express.Router();
const controller = require("../controllers/vendasController");
const { autenticarToken, autorizarPapeis } = require("../middleware/auth");

// Rotas para Vendas:

// Registrar uma nova venda para um cliente
router.post("/", autenticarToken, autorizarPapeis(['admin', 'gerente', 'vendedor']), controller.criarVenda);

// Listar todas as vendas (com filtros e pesquisa)
router.get("/", autenticarToken, controller.listarVendas);

// Obter detalhes de uma venda específica
router.get("/:id", autenticarToken, controller.getVendaById);

// Atualizar informações de uma venda (apenas admin e gerente)
router.put("/:id", autenticarToken, autorizarPapeis(['admin', 'gerente']), controller.atualizarVenda);

// Registrar pagamento parcial/total de uma venda
router.post("/:id/pagar", autenticarToken, autorizarPapeis(['admin', 'gerente', 'vendedor']), controller.registrarPagamento);

// Deletar uma venda (apenas admin)
router.delete("/:id", autenticarToken, autorizarPapeis(['admin']), controller.deletarVenda);

// Listar vendas de um cliente específico
router.get("/cliente/:clienteId", autenticarToken, controller.listarVendasPorCliente);


module.exports = router;