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

# Генератор статичных страниц с формулами
Калькулятор собирается с помощью static page generator'а, разработанного специально под этот проект.
Основная идея: 
1. возможность написания исходного контента в удобном формате (Markdown и формулы) 
2. сборка SPA, которые можно запускать без сервера у себя локально (т.е. вся логика на клиенте). 

Подход предназначен для случая, когда необходимо опубликовать интерактивный отчет, аналитическую статью и т.п.

Работает это следующим образом:
* Пользователь разрабатывает основной шаблон SPA в файле `index.html` (контейнер)
* Каждый блок контента разрабатывается в отдельном файле (лежат в `templates/`)
* Контейнер `index.html` задает с помощью ключевых слов _layout_ блоков. В том числе поддерживаются:
    * Табы с навигацией **<span style="color:darkgreen">(готово)</span>**
* Каждый блок может использовать следующий синтаксис:
    * HTML **<span style="color:darkgreen">(готово)</span>**
    * Markdown **<span style="color:darkorange">(в разработке)</span>**
    * Формулы LaTeX, MathML, ASCIIMath **<span style="color:darkorange">(в разработке)</span>**
        * рендеринг с помощью библиотеки MathJax
        * пре-процессинг с генерацией статичных картинок или преобразование в HTML+CSS         
* Пакет для публикации фомрируется средствами `gulp`. Есть две опции:
    * Публикация как SPA (блоки контента подгружаются AJAX запросами). Этот же вариант используется во время разработки (статичный сервер можно запускать прямо в папке `src/`). **<span style="color:darkgreen">(готово)</span>**
    * Публикация как статичная страница без сервера. Формируется статичный пакет. **<span style="color:darkorange">(в разработке)</span>**

## Сборка 
Конфигурацию сборки см. в файле `config.json`. Важные настройки:

`src`, `dest`: пути для исходников и результатов сборки

`isDevelopment`: если `true`, то это development сборка; иначе, production сборка

`mainScriptBlockLabel`, `subordinateScriptBlockLabel`: имя метки для обозначения тегов скриптов с основной страницы vs блоков. 
* Ссылки `<script>`, обернутые в `<!-- build:main -->...<!--endbuild-->`, будут заменены ссылкой на минифицированный скрипт. Требуется обернуть скрипты в `index.html`. 
* Ссылки `<script>`, обернутые в `<!-- build:sub -->...<!--endbuild-->`, будут вырезаны. Требуется обернуть скрипты в блоках.

## Запуск
Требуется установка сервера `node`, хотя в принципе можно запустить и с любого другого веб-сервера, умеющего раздавать статику и поддерживающего AJAX запросы. После запуска сервера идти на http://localhost:8080.
Во время разработки (`isDevelopment: true` в конфиге) файлы раздаются прямо из папки `src/`.

```
gulp
node server.js
```