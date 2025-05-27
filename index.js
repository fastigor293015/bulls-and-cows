const { input } = require("@inquirer/prompts");
const chalk = require("chalk");

const generateNumber = (length = 4) => {
  const digitsArr = [];
  for (let i = 0; i < length; i++) {
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
  console.log(`Добро пожаловать в игру "Быки и коровы"!`);
  const generatedNumber = generateNumber();
  // console.log(generatedNumber);
  try {
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
  } catch (error) {
    if (error instanceof Error && error.name === "ExitPromptError") {
      // noop; silence this error
    } else {
      throw error;
    }
  }
};

init();
