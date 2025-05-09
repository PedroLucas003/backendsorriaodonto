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
router.put('/users/:id/procedimento/:procedimentoId', verifyToken, AuthRegisterUserController.updateProcedimento);
router.delete('/users/:id/procedimento/:procedimentoId', verifyToken, AuthRegisterUserController.deleteProcedimento);
router.post('/refresh-token', AuthRegisterUserController.refreshToken);

module.exports = router;