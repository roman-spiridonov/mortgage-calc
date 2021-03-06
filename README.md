Страница и скрипт для расчета более выгодного варианта: **Ипотека или Аренда квартиры**.

Первая версия скрипта вдохновлена статьей https://geektimes.ru/post/190170/, однако рассматривается более точная модель, чем та, что была описана в статье.  В частности, в исходной статье вызывают вопросы формулы для погашения кредита. Кроме того, оставлен без внимания вопрос возможного роста зарплаты (как минимум, индексации).

# Результат
Можно посмотреть здесь: http://run.plnkr.co/plunks/HVeRY1cEdVo9ks5vSo6b/.

Скомпилированный отчет кладется в директорию `webapp`.
Скомпилировать из `src` его можно так:
```bash
$ gulp dev
$ gulp prod
$ gulp serve
```

Список задач см. в [`gulpfile.js`](gulpfile.js) данного проекта.

Настройки по умолчанию сборки лежат в [app.js](config/app.js).
По умолчанию, работает оффлайн-сборка (`isCDN: false`). 
Изменить эти настройки можно в файле [`.user-config.js`](.user-config.js). 

# Генератор
Для сборки используется генератор статичных страниц с формулами.
Предназначен для случая, когда необходимо опубликовать интерактивный отчет, аналитическую статью и т.п.

Основная идея: 
1. возможность написания исходного контента в удобном формате (Markdown и формулы) 
2. сборка SPA, которые можно запускать без сервера у себя локально (т.е. вся логика на клиенте). 

## Сценарий использования
Допустим, исходный проект представляет собой набор статичных страниц в директории `src/`.
Структура следующая:
```
src/
    fragments/
        page1.html
        page2.html
        page.js
    index.html
    script.js
```
 
Работает это следующим образом:
* Пользователь разрабатывает основной шаблон SPA в файле `index.html` (контейнер)
* Каждый блок контента разрабатывается в отдельном файле (лежат в `fragments/`)
* Контейнер `index.html` задает с помощью ключевых слов _layout_ блоков. В том числе поддерживаются:
    * Табы с навигацией **<span style="color:darkgreen">(готово)</span>**
* Каждый блок может использовать следующий синтаксис:
    * HTML **<span style="color:darkgreen">(готово)</span>**
    * Markdown **<span style="color:darkgreen">(готово)</span>**
    * Формулы LaTeX, MathML, ASCIIMath **<span style="color:darkgreen">(готово)</span>**
        * рендеринг с помощью библиотеки MathJax
        * пре-процессинг с генерацией статичных картинок или преобразование в HTML+CSS         
* Пакет для публикации фомрируется средствами `gulp`. Есть две опции:
    * Публикация как SPA (блоки контента подгружаются AJAX запросами). Этот же вариант используется во время разработки (статичный сервер можно запускать прямо в папке `src/`). **<span style="color:darkgreen">(готово)</span>**
    * Публикация как статичная страница без сервера. Формируется статичный пакет. **<span style="color:darkgreen">(готово)</span>**

## Конфигурация
Конфигурацию сборки см. в файле [`config/app.js`](config/app.js). Переопределить настройки можно в [`.user-config.js`](.user-config.js) в корне Вашего проекта. 

Важные настройки:

`src`, `dest`: пути для исходников и результатов сборки (по умолчанию, `src/` и `webapp/`)

`isDevelopment`: если `true`, то это development сборка; иначе, production сборка

`vendors`: словарь ссылок вида библиотека -> ссылка на CDN

`isCDN`: если `true`, будет использован словарь ссылок из `vendors`; иначе, файлы попадут в локальный `vendor.js` (`vendor.min.js` в случае production сборки)

`entryPoints`: массив входных точек в приложение для `browserify` относительно директории `src` (по умолчанию, `script.js` и `fragments/*.js`)

`serveFromSrc`: если `true`, то во время разработки (`isDevelopment: true`) файлы раздаются прямо из папки `src/`.


## Скрипты
Возможны два варианта обработки ссылок на скрипты:
1) Минификация: обернуть в `<!-- build:js -->` 
Используется для всех проектных файлов в `index.html`.
Ссылки `<script>`, обернутые в `<!-- build:js -->...<!--endbuild-->`, будут заменены ссылкой на минифицированный скрипт (собираемый из `src/`). 

2) Вырезание: обернуть в `<!-- build:cut -->`
Используется скриптов, используемых в фрагментах.
Ссылки `<script>`, обернутые в `<!-- build:cut -->...<!--endbuild-->`, будут вырезаны.


## Подключение в другой проект
Копируем репозиторий и делаем новый отчет в `src/`.
                                   
# Лицензия
[MIT](http://www.opensource.org/licenses/MIT)