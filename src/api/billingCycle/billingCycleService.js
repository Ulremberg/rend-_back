const BillingCycle = require("./billingCycle");
const errorHandler = require("../common/errorHandler");

BillingCycle.methods(["get", "post", "put", "delete"]);

/* Ao atualizar um elemento, a versão antiga será mostrada em tela.
Usamos o new para pegar a versão mais recente
e o runValidators para rodar as validações */
BillingCycle.updateOptions({ new: true, runValidators: true });

/* Chama o middleware de tratamento de erro após as requisições post e put */
BillingCycle.after("post", async (req, res, next) => {
  try {

    await errorHandler(req, res, next);
  } catch (error) {
    // Aqui você pode manipular o erro caso algo dê errado
    console.log(error);
  }
});

BillingCycle.after("put", async (req, res, next) => {
  try {
    await errorHandler(req, res, next);
  } catch (error) {
    // Aqui você pode manipular o erro caso algo dê errado
    console.log(error);
  }
});

/* Rota para recuperar o total de registros salvos */
BillingCycle.route("count", async (req, res, next) => {
  try {
    console.log("Total")
    const value = await BillingCycle.count();
    res.json({ value });
  } catch (error) {
    res.status(500).json({ errors: [error] });
  }
});

/* Rota para recuperar a soma dos valores de débito e crédito para efetuar
os futuros cálculos, através no método aggregate ($project e $group) */
BillingCycle.route("summary", async (req, res, next) => {
  try {
    console.log('Summary');
    const result = await BillingCycle.aggregate([
      {
        $project: {
          credit: { $sum: "$credits.value" },
          debt: { $sum: "$debts.value" },
        },
      },
      {
        $group: {
          _id: null,
          credit: { $sum: "$credit" },
          debt: { $sum: "$debt" },
        },
      },
      {
        $project: { _id: 0, credit: 1, debt: 1 }, // Booleano
      },
    ]).exec();

    console.log(result);

    // Caso não hajam registros na tabela, o crédito/débito vão ser retornados como 0
    res.json(result[0] || { credit: 0, debt: 0 });
  } catch (error) {
    res.status(500).json({ errors: [error] });
  }
});

module.exports = BillingCycle;
