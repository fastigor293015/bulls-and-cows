# Быки и коровы

## Описание игры

1. Первый игрок (в данном случае компьютер) загадывает **_4-х значное число_**, в котором цифры не повторяются;
2. Второй игрок должен угадать секретную комбинацию за наименьшее количество попыток. Помогают ему в этом быки и коровы...

- Коровы - количество угаданных цифр без учета их позиции в загаданной комбинации.
- Быки - количество угаданных цифр с учетом их позиции.

## Возможности

- Авторизация;
- Хранение истории игр.

Реализовано через Node.js

## Пример игры

<img src="https://sun9-32.userapi.com/s/v1/if2/ibTORKd3SOu3yAPAmWF7Wh8FLAO6OkVN1-bh4NWzn-w5THnZmU-wRLoSPKYR3tLDRn5Q-pZfHWSe1ie2Ubm0ux06.jpg?quality=95&as=32x30,48x45,72x68,108x102,160x151,240x227,360x340,480x453,540x510,561x530&from=bu&u=xiGMkDhPqyOrdqQyQhvPR_D039pCe5m1mJbSy8YnCco&cs=561x530"  width="465" height="500">

<br>

## Генерация комбинации

Происходит следующим образом:

1. Выполняем цикл из 4-х итераций;
2. На каждой из итераций генерируем случайную цифру от 1 до 9, пока не получим ту, которой ещё нет в массиве;
3. Добавляем полученную цифру в массив;
4. В самом конце объединяем элементы массива в одну строку.

```js
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
```
