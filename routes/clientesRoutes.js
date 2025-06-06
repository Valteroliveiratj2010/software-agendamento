const express = require("express");
const router = express.Router();
const controller = require("../controllers/clientesController");

router.get("/", controller.listarClientes);
router.post("/", controller.criarCliente);
router.put("/:id", controller.atualizarCliente);
router.delete("/:id", controller.deletarCliente);

module.exports = router;
