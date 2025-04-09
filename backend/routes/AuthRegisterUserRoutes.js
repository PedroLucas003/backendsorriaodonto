const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|JPEG|PNG)$/)) {
      return cb(new Error("É permitido somente o envio de jpg ou png!"));
    }
    cb(null, true);
  },
});

const AuthRegisterUserController = require("../controllers/AuthRegisterUserController");

// Rota inicial
router.get("/", AuthRegisterUserController.init);

// Criar usuário (registro permanece público)
router.post("/auth/register/user", upload.single("image"), AuthRegisterUserController.registerUser);

// Login (rota pública)
router.post("/auth/login", AuthRegisterUserController.loginUser);

// Prontuário Paciente - SEM TOKEN
router.post("/auth/prontuario", AuthRegisterUserController.getProntuario);

// Listar todos os usuários (protegida)
router.get("/auth/users", verifyToken, AuthRegisterUserController.getAllUsers);

// Atualizar usuário (protegida)
router.put("/auth/users/:id", verifyToken, upload.single("image"), AuthRegisterUserController.updateUser);

// Deletar usuário (protegida)
router.delete("/auth/users/:id", verifyToken, AuthRegisterUserController.deleteUser);

// Rota para servir imagens
router.get("/imagens/:nomeArquivo", (req, res) => {
  const nomeArquivo = req.params.nomeArquivo;
  const caminhoImagem = path.join(__dirname, "../uploads", nomeArquivo);

  res.sendFile(caminhoImagem, (err) => {
    if (err) {
      res.status(404).send("Imagem não encontrada");
    }
  });
});


module.exports = router;
