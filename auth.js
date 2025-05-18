function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token não fornecido ou mal formatado." });
    }

    const token = authHeader.split(" ")[1];

    // Remova o { ignoreExpiration: true } para respeitar o tempo de expiração
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Erro na verificação do token:", err);
            
            // Adicione mensagens mais específicas para diferentes tipos de erro
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ 
                    message: "Sessão expirada. Por favor, faça login novamente.",
                    code: "TOKEN_EXPIRED"
                });
            }
            
            return res.status(403).json({ 
                message: "Token inválido.",
                code: "INVALID_TOKEN"
            });
        }

        req.userId = decoded.id;
        next();
    });
}

module.exports = verifyToken;