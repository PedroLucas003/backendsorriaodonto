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

// ROTA DE ADICIONAR PROCEDIMENTO COM MULTI-UPLOAD
router.put(
    '/users/:id/procedimento', 
    verifyToken, 
    // --- MUDANÇA AQUI ---
    // Usamos .array() para múltiplos arquivos, e o nome do campo é 'arquivos'
    upload.array('arquivos', 10), // Limite de 10 arquivos
    AuthRegisterUserController.addProcedimento
);

// ROTA DE ATUALIZAR PROCEDIMENTO COM MULTI-UPLOAD
router.put(
    '/users/:id/procedimento/:procedimentoId', 
    verifyToken, 
    // --- MUDANÇA AQUI ---
    upload.array('arquivos', 10),
    AuthRegisterUserController.updateProcedimento
);

// Rota de deletar procedimento (sem alteração)
router.delete('/users/:id/procedimento/:procedimentoId', verifyToken, AuthRegisterUserController.deleteProcedimento);

// Rota de refresh token (sem alteração)
router.post('/refresh-token', AuthRegisterUserController.refreshToken);

module.exports = router;