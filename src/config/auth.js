const jwt = require('jsonwebtoken')
const env = require('../.env')

module.exports = async (req, res, next) => {
    if (req.method === "OPTIONS") {
      next();
    } else {
      const token = req.body.token || req.query.token || req.headers["authorization"];
  
      
  
      if (!token) {
        return res.status(403).send({ errors: ["No token provided."] });
      }
  
      try {
        const decoded = await jwt.verify(token, env.authSecret);
       
        // Caso eu queira utilizar esse token decodificado em outros lugares
        //req.decoded = decoded
        next();
      } catch (err) {
        console.log(err);
        return res.status(403).send({
          errors: ["Falha ao autenticar o token"],
        });
      }
    }
  };