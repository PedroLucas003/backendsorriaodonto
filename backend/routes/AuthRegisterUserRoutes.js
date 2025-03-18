const router = require("express").Router();
const multer = require("multer");
const path = require("path");

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

// Criar usuário
router.post("/auth/register/user", upload.single("image"), AuthRegisterUserController.registerUser);

// Listar todos os usuários
router.get("/auth/users", AuthRegisterUserController.getAllUsers);

// Atualizar usuário
router.put("/auth/users/:id", upload.single("image"), AuthRegisterUserController.updateUser);

// Deletar usuário
router.delete("/auth/users/:id", AuthRegisterUserController.deleteUser);

// Login Dentistas
router.post("/auth/login", AuthRegisterUserController.loginUser);

// Prontuário Paciente
router.post("/auth/prontuario", AuthRegisterUserController.getProntuario);

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