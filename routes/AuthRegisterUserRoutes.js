const router = require("express").Router();
const verifyToken = require("../auth");
const AuthRegisterUserController = require("../controllers/AuthRegisterUserController");

// Rotas públicas
router.post("/login", AuthRegisterUserController.loginUser);
router.post("/register/user", AuthRegisterUserController.registerUser);
router.post("/prontuario", AuthRegisterUserController.getProntuario);

// Rotas protegidas
router.get("/users", verifyToken, AuthRegisterUserController.getAllUsers);
router.put("/users/:id", verifyToken, AuthRegisterUserController.updateUser);
router.delete("/users/:id", verifyToken, AuthRegisterUserController.deleteUser);
router.put('/users/:id/procedimento', verifyToken, AuthRegisterUserController.addProcedimento);
router.put('/:id/procedimento/:procedimentoId', authMiddleware, AuthRegisterUserController.updateProcedimento);
router.delete('/:id/procedimento/:procedimentoId', authMiddleware, AuthRegisterUserController.deleteProcedimento);

module.exports = router;