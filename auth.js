const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Debug: Verifique se o JWT_SECRET está carregado
    console.log('[AUTH] JWT_SECRET:', process.env.JWT_SECRET ? '***loaded***' : 'MISSING!');

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn('[AUTH] Token não recebido ou formato inválido');
        return res.status(401).json({ 
            success: false,
            message: "Token de acesso requerido",
            code: "MISSING_TOKEN"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('[AUTH] Erro na verificação:', err.name);
            
            // Respostas específicas para cada tipo de erro
            const response = {
                success: false,
                message: "Falha na autenticação",
                code: "AUTH_ERROR"
            };

            if (err.name === "TokenExpiredError") {
                response.message = "Sessão expirada";
                response.code = "TOKEN_EXPIRED";
                return res.status(401).json(response);
            }

            if (err.name === "JsonWebTokenError") {
                response.message = "Token inválido";
                response.code = "INVALID_TOKEN";
                return res.status(403).json(response);
            }

            return res.status(403).json(response);
        }

        console.log(`[AUTH] Usuário autenticado ID: ${decoded.id}`);
        req.userId = decoded.id;
        next();
    });
};

module.exports = verifyToken; // Exportação direta (sem objeto)