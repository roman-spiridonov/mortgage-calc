Страница и скрипт для расчета более выгодного варианта: **Ипотека или Аренда квартиры**.

Первая версия скрипта вдохновлена статьей https://geektimes.ru/post/190170/, однако рассматривается более точная модель, чем та, что была описана в статье.  В частности, в исходной статье вызывают вопросы формулы для погашения кредита. Кроме того, оставлен без внимания вопрос возможного роста зарплаты (как минимум, индексации).

# Как читать результаты
Будем искать:
* Число месяцев для оплаты квартиры посредством кредита: $m$ 
* Число месяцев депозита:  $n$
* Стоимость квартиры сегодня: $S$

Исходя из следующих данных:
* Ставка по депозиту (% годовых): $F$ --> $f = 1+\frac{F/12}{100}$
* Ставка по кредиту (% годовых): $G$ --> $g = 1+\frac{G/12}{100}$
* Ставка роста цен на недвижимость (% годовых): $H$ --> $h = 1+\frac{H/12}{100}$
* Рост доходов (% годовых): $W$ --> $w = 1+\frac{W/12}{100}$
* Имеющиеся накопления: $A$
* Ежемесячные накопления (идет на депозитный вклад): $B$
* Стоимость аренды: $R$ --> на кредит в первый месяц пойдет сумма $B+R$ 

Результат вычислений по заданным параметрам модели представляет собой два графика:

1. (основной) $f(n) = m(n)$ для произвольной $S$: график показывает, быстрее на квартиру накопить, сохраняя деньги на депозите или выплачивая за нее кредит:
	- Быстрее накопить ($m>n$): график лежит выше кривой безразличия
	- Быстрее выплатить кредит ($m<n$): график лежит ниже кривой безразличия

	Число месяцев, на которое выгоднее тот или иной вариант, равно расстоянию по вертикали до _кривой безразличия_.

2. $S(n)$ - показывает стоимость квартиры *сегодня* (т. е. в ценах сегодняшнего дня), которую можно себе будет позволить при накоплении в течение $n$ лет (учтено, что эта квартира будет стоить больше через `n` лет). Очевидно, что график возрастает, если $F+W>H$ (накапливаем быстрее, чем растут цены).

# Описание решения
Рассмотрим два варианта задачи.

## Вариант 1: рост доходов не учитываем
Для **Депозита** равенство получаем, приравнивая стоимость квартиры через $n$ лет к сумме накоплений, состоящей из:
* $Af^n$: положили в банк уже имеющиеся накопления
* $B + Bf + Bf^2 + ... + Bf^n$: 

Имеем:
$$Sh^n = Af^n + B(f^n + f^{n-1} + \cdots + f)$$

## Вариант 2: с учетом роста доходов
=======
1. (основной) `f(n) = m(n)` для произвольной `S`: график показывает, быстрее на квартиру накопить, сохраняя деньги на депозите или выплачивая за нее кредит:
	- Быстрее накопить (`m`>`n`): график лежит выше кривой безразличия
	- Быстрее взять и выплатить кредит (`m`<`n`): график лежит ниже кривой безразличия
	
2. `S(n)` - показывает стоимость квартиры *сегодня*, которую можно себе будет позволить при накоплении в течение `n` лет (учтено, что эта квартира будет стоить больше через `n` лет).

# Запуск
Требуется установка сервера `node`, хотя в принципе можно запустить и с любого другого веб-сервера, умеющего раздавать статику и поддерживающего AJAX запросы. После запуска сервера идти на http://localhost:8080.

```
node server.js
```
