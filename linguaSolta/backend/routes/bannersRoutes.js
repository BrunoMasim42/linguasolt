const router = require('express').Router();
const c=require('../controllers/bannersController');
const auth=require('../middleware/auth');
const upload=require('../middleware/upload');
router.get('/', c.listar);
router.post('/', auth, upload.single('imagem'), c.criar);
router.put('/:id', auth, upload.single('imagem'), c.atualizar);
router.delete('/:id', auth, c.excluir);
module.exports=router;
