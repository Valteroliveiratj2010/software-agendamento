const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const autenticarToken = require('../middleware/auth');

router.post('/', autenticarToken, clienteController.cadastrarCliente);
router.get('/', autenticarToken, clienteController.listarClientes);

module.exports = router;
