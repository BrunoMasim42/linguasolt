const router = require('express').Router();
const c=require('../controllers/contatosController');
const auth=require('../middleware/auth');
router.get('/', auth, c.listar);
router.post('/', c.criar);
router.put('/:id/lido', auth, c.marcarLido);
router.delete('/:id', auth, c.excluir);
module.exports=router;
