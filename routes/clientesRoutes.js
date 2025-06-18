// routes/clientesRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.js');
const {
  listarClientes,
  getClienteById,
  criarCliente,
  atualizarCliente,
  deletarCliente
} = require('../controllers/clientesController');

router.use(authMiddleware);

router.route('/')
  .get(listarClientes)
  .post(criarCliente);

router.route('/:id')
  .get(getClienteById)
  .put(atualizarCliente)
  .delete(deletarCliente);

module.exports = router;