const router = require("express").Router();
const verifyToken = require("../auth");
const AuthRegisterUserController = require("../controllers/AuthRegisterUserController");

// Rota inicial de teste
router.get("/", (req, res) => {
  res.json({ message: "API Sorria Odonto funcionando!" });
});

// Rotas públicas
router.post("/auth/register/user", AuthRegisterUserController.registerUser);
router.post("/auth/login", AuthRegisterUserController.loginUser);
router.post("/auth/prontuario", AuthRegisterUserController.getProntuario);

// Rotas protegidas por token
router.get("/auth/users", verifyToken, AuthRegisterUserController.getAllUsers);
router.put("/auth/users/:id", verifyToken, AuthRegisterUserController.updateUser);
router.delete("/auth/users/:id", verifyToken, AuthRegisterUserController.deleteUser);
router.put('/auth/users/:id/procedimento', verifyToken, AuthRegisterUserController.addProcedimento);

module.exports = router;