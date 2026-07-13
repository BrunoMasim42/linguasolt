const router = require('express').Router();
const c=require('../controllers/paginasController');
const auth=require('../middleware/auth');
router.get('/:slug', c.buscarPorSlug);
router.put('/:slug', auth, c.atualizar);
module.exports=router;
