const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./user");
const env = require("../../.env");

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/;

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = [];
  _.forIn(dbErrors.errors, (error) => errors.push(error.message));
  return res.status(400).json({ errors });
};

const login = async (req, res, next) => {
  const email = req.body.email || "";
  const password = req.body.password || "";
  try {
    const user = await User.findOne({ email });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(user.toJSON(), env.authSecret, {
        expiresIn: "1 day",
      });
      const { name, email } = user;
      return res.json({ name, email, token });
    } else {
      throw { status: 400, message: "Usuário/Senha inválidos" };
    }
  } catch (error) {
    const { status, message } = error;
    return res.status(status || 500).send({ errors: [message] });
  }
};

const validateToken = (req, res, next) => {
  const token = req.body.token || "";
 
  jwt.verify(token, env.authSecret, function (err, decoded) {
    return res.status(200).send({ valid: !err });
  });
};

const signup = async (req, res, next) => {
  try {
    const name = req.body.name || "";
    const email = req.body.email || "";
    const password = req.body.password || "";
    const confirmPassword = req.body.confirm_password || "";
    if (!email.match(emailRegex)) {
      throw { status: 400, message: "O e-mail informado está inválido" };
    }
    if (!password.match(passwordRegex)) {
      throw {
        status: 400,
        message:
          "Senha precisa ter: uma letra maiúscula, uma letra minúscula, um número, um caractere especial (@#$%) e tamanho entre 6-20.",
      };
    }
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);
    if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
      throw { status: 400, message: "Senhas não conferem." };
    }
    const user = await User.findOne({ email });
    if (user) {
      throw { status: 400, message: "Usuário já cadastrado." };
    }

    const newUser = await new User({ name, email, password: passwordHash });

    console.log(newUser) ;
    await newUser.save();
    login(req, res, next);
  } catch (error) {
    const { status, message } = error;
    return res.status(status).send({ errors: [message] });
  }
};

module.exports = { login, signup, validateToken };
