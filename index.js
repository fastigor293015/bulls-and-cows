const { input, select, password } = require("@inquirer/prompts");
const chalk = require("chalk");

const bcrypt = require("bcrypt");
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "gamedata.db",
  logging: false,
});

const userData = {};

class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

class Result extends Model {}
Result.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    combination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Result",
  }
);

const register = async () => {
  const login = await input({
    message: "Логин:",
    validate: async (value) => {
      const existingUser = await User.findOne({
        where: {
          login: value,
        },
      });
      if (existingUser) return "Пользователь с таким логином уже зарегистрирован!";

      return true;
    },
  });

  const passwordValue = await password({
    message: "Пароль:",
    mask: true,
  });

  const hashedPassword = await bcrypt.hash(passwordValue, 12);

  const createdUser = await User.create({ login, password: hashedPassword });
  console.log(chalk.green.bold("Успешная регистрация!"));
  userData.id = createdUser.id;
  gameStart();
};

const auth = async () => {
  const login = await input({
    message: "Логин:",
    validate: async (value) => {
      const user = await User.findOne({
        where: {
          login: value,
        },
      });

      if (!user) return "Пользователя с таким логином не существует!";

      return true;
    },
  });

  await password({
    message: "Пароль:",
    mask: true,
    validate: async (value) => {
      const user = await User.findOne({
        where: {
          login,
        },
      });
      const isMatch = await bcrypt.compare(value, user.password);
      if (!isMatch) return "Неверный пароль";
      userData.id = user.id;
      return true;
    },
  });

  console.log(chalk.green.bold("Успешная авторизация!"));
  gameStart();
};

const generateNumber = (length = 4) => {
  const digitsArr = [];
  for (let i = 0; i < length; i++) {
    // Генерируем случайную цифру от 1 до 9, пока не получим ту, которой ещё нет в массиве
    let digit;
    do {
      digit = Math.ceil(Math.random() * 8.9 + 0.1);
    } while (digitsArr.some((value) => value === digit));
    digitsArr.push(digit);
  }
  return digitsArr.join("");
};

const check = (inputStr, targetStr) => {
  if (inputStr.length !== targetStr.length) return;
  let bulls = 0,
    cows = 0;
  for (let i = 0; i < inputStr.length; i++) {
    if (inputStr[i] === targetStr[i]) {
      bulls++;
    } else if (targetStr.includes(inputStr[i])) {
      cows++;
    }
  }

  return {
    bulls,
    cows,
  };
};

const init = async () => {
  await User.sync();
  await Result.sync();
  await select({
    message: "Выберите действие:",
    choices: [
      {
        name: "Регистрация",
        value: "register",
      },
      {
        name: "Авторизация",
        value: "auth",
      },
      {
        name: "Выход",
        value: "exit",
      },
    ],
  }).then((actionName) => {
    switch (actionName) {
      case "register":
        register();
        break;
      case "auth":
        auth();
        break;

      default:
        process.exit(0);
    }
  });
};

const gameStart = async () => {
  console.log(`Добро пожаловать в игру "Быки и коровы"!`);
  const generatedNumber = generateNumber();
  // console.log(generatedNumber);
  let inputNumber,
    attemptsCount = 0;
  do {
    inputNumber = await input({
      message: "Введите комбинацию:",
      validate: (value) =>
        value.length !== 4
          ? "Число должно состоять из 4 цифр!"
          : /(.).*\1/.test(value)
          ? "Цифры не должны повторяться!"
          : true,
    });
    attemptsCount++;
    const { bulls, cows } = check(inputNumber, generatedNumber);
    console.log(chalk.yellow.bold(`№${attemptsCount}   Быки: ${bulls}   Коровы: ${cows}`));
  } while (inputNumber !== generatedNumber);

  console.log(chalk.green.bold("Вы победили!"));
  console.log(chalk.green.bold(`Комбинацию "${generatedNumber}" Вы отгадали за ${attemptsCount} попыток.`));
  await Result.create({
    userId: userData.id,
    combination: generatedNumber,
    attempts: attemptsCount,
  });
};

init();

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    // noop; silence this error
  } else {
    throw error;
  }
});
