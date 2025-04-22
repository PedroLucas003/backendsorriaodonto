const router = require("express").Router();
const verifyToken = require("../auth");
const AuthRegisterUserController = require("../controllers/AuthRegisterUserController");

// ======================
// Rotas Públicas
// ======================
router.post("/register/user", AuthRegisterUserController.registerUser);
router.post("/login", AuthRegisterUserController.loginUser);
router.post("/prontuario", AuthRegisterUserController.getProntuario);

// ======================
// Rotas Protegidas
// ======================
router.get("/users", verifyToken, AuthRegisterUserController.getAllUsers);
router.put("/users/:id", verifyToken, AuthRegisterUserController.updateUser);
router.delete("/users/:id", verifyToken, AuthRegisterUserController.deleteUser);
router.put('/users/:id/procedimento', verifyToken, AuthRegisterUserController.addProcedimento);

// ======================
// Rota de Teste (opcional)
// ======================
router.get("/status", (req, res) => {
  res.json({ 
    status: "active",
    service: "Auth API",
    version: "1.0.0"
  });
});

module.exports = router;