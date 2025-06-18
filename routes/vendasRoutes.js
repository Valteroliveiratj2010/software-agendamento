// routes/vendasRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.js');
const {
  criarVenda,
  listarVendas,
  getVendaById,
  // Adicione aqui as outras funções quando as criar no controller
} = require('../controllers/vendasController');

router.use(authMiddleware);

router.route('/')
  .get(listarVendas)
  .post(criarVenda);

// Esta é a sua "linha 27"
router.route('/:id')
  .get(getVendaById);
  // Adicione .put(atualizarVenda) etc. quando criar as funções

module.exports = router;