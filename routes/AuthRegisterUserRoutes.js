const router = require("express").Router();
const verifyToken = require("../auth");
const AuthRegisterUserController = require("../controllers/AuthRegisterUserController");
const upload = require('../middleware/upload'); // Sua importação está correta

// Rotas públicas (sem alteração)
router.post("/login", AuthRegisterUserController.loginUser);
router.post("/register/user", AuthRegisterUserController.registerUser);
router.post("/prontuario", AuthRegisterUserController.getProntuario);

// Rotas protegidas
router.get("/users", verifyToken, AuthRegisterUserController.getAllUsers);
router.put("/users/:id", verifyToken, AuthRegisterUserController.updateUser);
router.delete("/users/:id", verifyToken, AuthRegisterUserController.deleteUser);

// ROTA DE ADICIONAR PROCEDIMENTO COM MIDDLEWARE DE UPLOAD
router.put(
    '/users/:id/procedimento', 
    verifyToken, 
    upload.single('arquivo'), // <-- MODIFICADO: Adicionado middleware aqui
    AuthRegisterUserController.addProcedimento
);

// ROTA DE ATUALIZAR PROCEDIMENTO COM MIDDLEWARE DE UPLOAD
router.put(
    '/users/:id/procedimento/:procedimentoId', 
    verifyToken, 
    upload.single('arquivo'), // <-- MODIFICADO: Adicionado middleware aqui
    AuthRegisterUserController.updateProcedimento
);

// Rota de deletar procedimento (sem alteração)
router.delete('/users/:id/procedimento/:procedimentoId', verifyToken, AuthRegisterUserController.deleteProcedimento);

// Rota de refresh token (sem alteração)
router.post('/refresh-token', AuthRegisterUserController.refreshToken);

module.exports = router;