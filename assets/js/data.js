/*!
 * Данные для калькулятора, планировщика сроков и галерей кейсов ЦРВУ.
 * Источник: crvu/strategy/data.json (разделы calculator, planner, expo_calendar), срез на 09.10.2026.
 *
 * Цены калькулятора — по документу «Цены для калькулятора ЦРВУ» от 19.11.2026 (вариант V5-20112026).
 * Чтобы изменить расчёт, достаточно поправить числа ниже: формулы лежат в tools.js.
 */
(function (w) {
  'use strict';

  w.CRVU_DATA = {
    asOf: '2026-11-20',

    /* ---------- Калькулятор-ориентир ----------
       Источник: «Цены для калькулятора ЦРВУ» от 19.11.2026 (обсуждение 13.11.2026), передан ЦРВУ 20.11.2026.
       Расчёт: площадь × нижняя и верхняя ставка уровня × коэффициент типа застройки. Скидка за большой метраж не закладывается.
       Нерешённые вопросы документа (НДС, коэффициент острова, премиум-линейный, второй этаж, шкала малых площадей)
       автоматически не применяются: в результате выводится пометка «уточним в смете». */
    calculator: {
      model: 'V5-20112026',
      areaMin: 6,
      areaMax: 1000,
      smallMax: 20,               /* до 20 м² включительно — индивидуальный расчёт */
      round: 10000,
      levels: {
        economy:   { label: 'Эконом',    min: 25000, max: 30000,  openEnded: false, text: 'Высота до 2,5 м, простые решения и стандартные элементы декора.' },
        exclusive: { label: 'Эксклюзив', min: 35000, max: 55000,  openEnded: false, text: 'Авторская архитектура и индивидуальное производство.' },
        premium:   { label: 'Премиум',   min: 55000, max: 100000, openEnded: true,  text: 'Сложная геометрия, авторский декор и мультимедиа по проекту.' }
      },
      /* k — коэффициент к базовой цене; null — коэффициент не утверждён, считаем по базе и пишем пометку */
      types: {
        linear:    { label: 'Линейный',   sides: 1, k: 1.10, premiumK: null },
        corner:    { label: 'Угловой',    sides: 2, k: 1.00 },
        peninsula: { label: 'Полуостров', sides: 3, k: 1.00 },
        island:    { label: 'Остров',     sides: 4, k: null }
      },
      /* малые площади: обсуждавшиеся бюджеты, не формула */
      small: [
        { upTo: 10, text: 'от 500 000 ₽, индивидуальный расчёт' },
        { upTo: 20, text: 'для примера: стенд 12 м² — 600 000–800 000 ₽' }   /* пример «около 20 м² — около 1 млн ₽» требует уточнения, на сайт не выводим */
      ],
      led:  { label: 'LED-экран 3 × 2 м', min: 100000, max: 130000, maxQty: 6 },   /* ₽ за экран */
      suspPoint: { min: 25000, max: 150000 },                                      /* ₽ за точку подвеса, тариф площадки */
      note: 'Это предварительный ориентир стоимости. Точную смету подготовим по плану площадки и комплектации стенда. Аренда площади, сборы организатора, подключения и работы площадки рассчитываются отдельно.'
    },

    /* ---------- Площадки ---------- */
    venues: {
      crocus: { label: 'Крокус Экспо',    docBdays: 14 },
      texpo:  { label: 'Тимирязев Центр', docBdays: 15 },
      other:  { label: 'Другая площадка', docBdays: null }
    },
    /* список площадок для калькулятора и квиза */
    venueOptions: [
      { value: 'crocus',   label: 'Крокус Экспо',    key: 'crocus' },
      { value: 'expocentr', label: 'Экспоцентр',     key: 'other' },
      { value: 'vdnh',     label: 'ВДНХ',            key: 'other' },
      { value: 'expoforum', label: 'Экспофорум',     key: 'other' },
      { value: 'texpo',    label: 'Тимирязев Центр', key: 'texpo' },
      { value: 'other',    label: 'Другая площадка', key: 'other' }
    ],

    /* ---------- Модель планировщика ---------- */
    model: {
      comfortableMonths: 3,   /* комфортный старт: за 3 месяца до открытия */
      standardWeeks: 6,       /* стандартный старт: за 6 недель до первого дня монтажа */
      latestMinusBdays: 5,    /* последний старт без наценки: срок подачи документов минус 5 рабочих дней */
      expressDays: 12,        /* предел экспресса: открытие минус 1 день минус 12 дней */
      setupOffsetDays: 5      /* если организатор не публикует монтаж: за 5 дней до открытия */
    },

    /* ---------- Календарь выставок (44 позиций, ноябрь 2026 — октябрь 2027). 09.11.2026 добавлены выставки января–марта 2027 из файла ЦРВУ «Выставки 2027», даты и площадки сверены с expomap.ru и сайтами организаторов ---------- */
    expos: [
      {
        "id": "pharmtech-2026",
        "name": "Pharmtech & Ingredients 2026",
        "dates": "24–27.11.2026",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Фармацевтика и ингредиенты",
        "confirmed": true,
        "open": "2026-11-24",
        "close": "2026-11-27",
        "setup": null,
        "planner": {
          "first_setup_day": "2026-11-19",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-08-24",
          "standard_start": "2026-10-08",
          "docs_deadline": "2026-10-30",
          "latest_start_without_venue_surcharge": "2026-10-23",
          "express_limit_start": "2026-11-11"
        }
      },
      {
        "id": "zdravoohranenie-2026",
        "name": "Здравоохранение-2026",
        "dates": "7–10.12.2026",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Медицина и здравоохранение",
        "confirmed": true,
        "open": "2026-12-07",
        "close": "2026-12-10",
        "setup": "02–06.12.2026",
        "planner": {
          "first_setup_day": "2026-12-02",
          "first_setup_day_basis": "опубликован организатором",
          "comfortable_start": "2026-09-07",
          "standard_start": "2026-10-21",
          "docs_deadline": "2026-11-12",
          "latest_start_without_venue_surcharge": "2026-11-05",
          "express_limit_start": "2026-11-24"
        }
      },
      {
        "id": "agravia-2027",
        "name": "AGRAVIA 2027",
        "dates": "20–22.01.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "АПК: технологии производства и переработки",
        "confirmed": true,
        "open": "2027-01-20",
        "close": "2027-01-22",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "upakexpo-2027",
        "name": "UPAKEXPO 2027",
        "dates": "26–29.01.2027",
        "venue": "ВДНХ Экспо",
        "venueKey": "other",
        "industry": "Упаковка, пластик, переработка",
        "confirmed": true,
        "open": "2027-01-26",
        "close": "2027-01-29",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-01-21",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-10-26",
          "standard_start": "2026-12-10",
          "docs_deadline": null,
          "latest_start_without_venue_surcharge": null,
          "express_limit_start": "2027-01-13"
        }
      },
      {
        "id": "recycling-solutions-2027",
        "name": "RECYCLING SOLUTIONS 2027",
        "dates": "26–29.01.2027",
        "venue": "ВДНХ Экспо",
        "venueKey": "other",
        "industry": "Переработка и утилизация отходов",
        "confirmed": true,
        "open": "2027-01-26",
        "close": "2027-01-29",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "dairytech-2027",
        "name": "DairyTech 2027",
        "dates": "26–28.01.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Молочная и пищевая промышленность: оборудование и технологии",
        "confirmed": true,
        "open": "2027-01-26",
        "close": "2027-01-28",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "ruplastica-2027",
        "name": "RUPLASTICA 2027",
        "dates": "26–29.01.2027",
        "venue": "ВДНХ Экспо",
        "venueKey": "other",
        "industry": "Пластмассы и каучуки",
        "confirmed": true,
        "open": "2027-01-26",
        "close": "2027-01-29",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "aquaflame-2027",
        "name": "Aquaflame 2027",
        "dates": "1–4.02.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Отопление, водоснабжение, бассейны, инженерные решения",
        "confirmed": true,
        "open": "2027-02-01",
        "close": "2027-02-04",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-01-27",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-11-01",
          "standard_start": "2026-12-16",
          "docs_deadline": "2027-01-07",
          "latest_start_without_venue_surcharge": "2026-12-31",
          "express_limit_start": "2027-01-19"
        }
      },
      {
        "id": "airvent-2027",
        "name": "AIRVent 2027",
        "dates": "1–4.02.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Вентиляция, кондиционирование, холодоснабжение",
        "confirmed": true,
        "open": "2027-02-01",
        "close": "2027-02-04",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "nais-2027",
        "name": "НАИС 2027",
        "dates": "10–11.02.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Авиационная инфраструктура, аэропорты",
        "confirmed": true,
        "open": "2027-02-10",
        "close": "2027-02-11",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "drontech-2027",
        "name": "ДРОНТЕХ 2027",
        "dates": "10–11.02.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Беспилотные системы, роботизация",
        "confirmed": true,
        "open": "2027-02-10",
        "close": "2027-02-11",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "skrepka-2027",
        "name": "Скрепка Экспо 2027",
        "dates": "16–18.02.2027",
        "venue": "Тимирязев Центр",
        "venueKey": "texpo",
        "industry": "Канцелярские товары, сувениры, игрушки",
        "confirmed": true,
        "open": "2027-02-16",
        "close": "2027-02-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "artdom-2027",
        "name": "ARTDOM 2027",
        "dates": "18–20.02.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Мебель, интерьер, искусство",
        "confirmed": true,
        "open": "2027-02-18",
        "close": "2027-02-20",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "cpm-spring-2027",
        "name": "CPM Collection Première Moscow. Весна 2027",
        "dates": "23–26.02.2027",
        "venue": "ВДНХ Экспо",
        "venueKey": "other",
        "industry": "Одежда, обувь, аксессуары",
        "confirmed": true,
        "open": "2027-02-23",
        "close": "2027-02-26",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "prodexpo-2027",
        "name": "Продэкспо-2027",
        "dates": "01–04.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Продукты питания, напитки, оборудование",
        "confirmed": true,
        "open": "2027-03-01",
        "close": "2027-03-04",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-02-24",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-12-01",
          "standard_start": "2027-01-13",
          "docs_deadline": "2027-02-04",
          "latest_start_without_venue_surcharge": "2027-01-28",
          "express_limit_start": "2027-02-16"
        }
      },
      {
        "id": "yugbuild-2027",
        "name": "YugBuild 2027",
        "dates": "2–5.03.2027",
        "venue": "Экспоград Юг, Краснодар",
        "venueKey": "other",
        "industry": "Строительство и интерьер",
        "confirmed": true,
        "open": "2027-03-02",
        "close": "2027-03-05",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "interlakokraska-2027",
        "name": "Интерлакокраска 2027",
        "dates": "15–18.03.2027",
        "venue": "Тимирязев Центр",
        "venueKey": "texpo",
        "industry": "Лакокрасочная промышленность",
        "confirmed": true,
        "open": "2027-03-15",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "transrussia-2027",
        "name": "TransRussia / SkladTech 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Транспорт, логистика, складские технологии",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-03-11",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-12-16",
          "standard_start": "2027-01-28",
          "docs_deadline": "2027-02-19",
          "latest_start_without_venue_surcharge": "2027-02-12",
          "express_limit_start": "2027-03-03"
        }
      },
      {
        "id": "metalloobrabotka-svarka-ekb-2027",
        "name": "Металлообработка. Сварка 2027 (Екатеринбург)",
        "dates": "16–19.03.2027",
        "venue": "Екатеринбург-ЭКСПО",
        "venueKey": "other",
        "industry": "Машиностроение, металлообработка, сварка",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-19",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "metallurgy-litmash-ekb-2027",
        "name": "Металлургия. Литмаш. Аддитивные технологии 2027",
        "dates": "16–19.03.2027",
        "venue": "Екатеринбург-ЭКСПО",
        "venueKey": "other",
        "industry": "Металлургия, литейное производство, аддитивные технологии",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-19",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "christmasbox-2027",
        "name": "ChristmasBox Podarki 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Новогодняя и праздничная индустрия",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "igrushka-market-2027",
        "name": "Игрушка Маркет 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Детские товары и игрушки",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "klei-germetiki-2027",
        "name": "Клеи и герметики 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Клеи и герметики (в рамках «Полиуретанэкс»)",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "chemicos-industry-2027",
        "name": "ChemiCos Industry 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Сырьё и оборудование для бытовой химии и косметики",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "chemipack-2027",
        "name": "ChemiPack 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Упаковка и маркировка для бытовой химии и косметики",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "chemicos-stm-2027",
        "name": "ChemiCos СТМ 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Контрактное производство и СТМ",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "chemicos-2027",
        "name": "ChemiCos 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Бытовая и профессиональная химия",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "beautychemicos-2027",
        "name": "BeautyChemiCos 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Косметика и парфюмерия",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "household-spring-2027",
        "name": "HouseHold Expo. Весна 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Товары для дома",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "kompozit-expo-2027",
        "name": "Композит-Экспо 2027",
        "dates": "16–18.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Композитные материалы, технологии и оборудование",
        "confirmed": true,
        "open": "2027-03-16",
        "close": "2027-03-18",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "gaz-neft-sever-2027",
        "name": "Газ. Нефть. Новые технологии – Крайнему Северу 2027",
        "dates": "18–19.03.2027",
        "venue": "ДЦ «Ямал», Новый Уренгой",
        "venueKey": "other",
        "industry": "Нефтегазовая отрасль",
        "confirmed": true,
        "open": "2027-03-18",
        "close": "2027-03-19",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "modern-bakery-2027",
        "name": "Modern Bakery | Confex 2027",
        "dates": "23–26.03.2027",
        "venue": "Тимирязев Центр",
        "venueKey": "texpo",
        "industry": "Хлебопечение, кондитерская отрасль",
        "confirmed": true,
        "open": "2027-03-23",
        "close": "2027-03-26",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-03-18",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-12-23",
          "standard_start": "2027-02-04",
          "docs_deadline": "2027-02-25",
          "latest_start_without_venue_surcharge": "2027-02-18",
          "express_limit_start": "2027-03-10"
        }
      },
      {
        "id": "agrokompleks-2027",
        "name": "АГРОКОМПЛЕКС 2027",
        "dates": "23–26.03.2027",
        "venue": "ВДНХ-ЭКСПО, Уфа",
        "venueKey": "other",
        "industry": "Агропромышленный комплекс",
        "confirmed": true,
        "open": "2027-03-23",
        "close": "2027-03-26",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "r-beauty-2027",
        "name": "R-BEAUTY 2027",
        "dates": "23–25.03.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Парфюмерия и косметика",
        "confirmed": true,
        "open": "2027-03-23",
        "close": "2027-03-25",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "gotovo-2027",
        "name": "GOTOVO 2027",
        "dates": "23–26.03.2027",
        "venue": "Тимирязев Центр",
        "venueKey": "texpo",
        "industry": "Готовая еда: оборудование, ингредиенты, технологии",
        "confirmed": true,
        "open": "2027-03-23",
        "close": "2027-03-26",
        "setup": null,
        "planner": {
          "first_setup_day_basis": "допущение: за 5 дней до открытия"
        }
      },
      {
        "id": "mosbuild-2027",
        "name": "MosBuild 2027",
        "dates": "30.03–02.04.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Строительство и интерьер",
        "confirmed": true,
        "open": "2027-03-30",
        "close": "2027-04-02",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-03-25",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2026-12-30",
          "standard_start": "2027-02-11",
          "docs_deadline": "2027-03-05",
          "latest_start_without_venue_surcharge": "2027-02-26",
          "express_limit_start": "2027-03-17"
        }
      },
      {
        "id": "expoelectronica-2027",
        "name": "ExpoElectronica 2027",
        "dates": "13–15.04.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Электроника и электронные компоненты",
        "confirmed": true,
        "open": "2027-04-13",
        "close": "2027-04-15",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-04-08",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2027-01-13",
          "standard_start": "2027-02-25",
          "docs_deadline": "2027-03-19",
          "latest_start_without_venue_surcharge": "2027-03-12",
          "express_limit_start": "2027-03-31"
        }
      },
      {
        "id": "metalworking-2027",
        "name": "Металлообработка-2027",
        "dates": "11–14.05.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Металлообработка, станки",
        "confirmed": true,
        "open": "2027-05-11",
        "close": "2027-05-14",
        "setup": "05–10.05.2027",
        "planner": {
          "first_setup_day": "2027-05-05",
          "first_setup_day_basis": "опубликован организатором",
          "comfortable_start": "2027-02-11",
          "standard_start": "2027-03-24",
          "docs_deadline": "2027-04-15",
          "latest_start_without_venue_surcharge": "2027-04-08",
          "express_limit_start": "2027-04-28"
        }
      },
      {
        "id": "ctt-expo-2027",
        "name": "CTT Expo 2027",
        "dates": "25–28.05.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Строительная и дорожная техника",
        "confirmed": true,
        "open": "2027-05-25",
        "close": "2027-05-28",
        "setup": "22–24.05.2027",
        "planner": {
          "first_setup_day": "2027-05-22",
          "first_setup_day_basis": "опубликован организатором",
          "comfortable_start": "2027-02-25",
          "standard_start": "2027-04-10",
          "docs_deadline": "2027-05-04",
          "latest_start_without_venue_surcharge": "2027-04-27",
          "express_limit_start": "2027-05-12"
        }
      },
      {
        "id": "rosupack-2027",
        "name": "RosUpack 2027",
        "dates": "15–18.06.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Упаковка",
        "confirmed": true,
        "open": "2027-06-15",
        "close": "2027-06-18",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-06-10",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2027-03-15",
          "standard_start": "2027-04-29",
          "docs_deadline": "2027-05-21",
          "latest_start_without_venue_surcharge": "2027-05-14",
          "express_limit_start": "2027-06-02"
        }
      },
      {
        "id": "mims-2027",
        "name": "MIMS Automobility Moscow 2027",
        "dates": "24–27.08.2027",
        "venue": "ВДНХ Экспо",
        "venueKey": "other",
        "industry": "Автомобильная отрасль, автосервис",
        "confirmed": true,
        "open": "2027-08-24",
        "close": "2027-08-27",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-08-19",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2027-05-24",
          "standard_start": "2027-07-08",
          "docs_deadline": null,
          "latest_start_without_venue_surcharge": null,
          "express_limit_start": "2027-08-11"
        }
      },
      {
        "id": "worldfood-2027",
        "name": "WorldFood Moscow 2027",
        "dates": "14–17.09.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Продукты питания и напитки",
        "confirmed": true,
        "open": "2027-09-14",
        "close": "2027-09-17",
        "setup": null,
        "planner": {
          "first_setup_day": "2027-09-09",
          "first_setup_day_basis": "допущение: за 5 дней до открытия",
          "comfortable_start": "2027-06-14",
          "standard_start": "2027-07-29",
          "docs_deadline": "2027-08-20",
          "latest_start_without_venue_surcharge": "2027-08-13",
          "express_limit_start": "2027-09-01"
        }
      },
      {
        "id": "agroprodmash-2027",
        "name": "Агропродмаш-2027",
        "dates": "28.09–01.10.2027",
        "venue": "Крокус Экспо",
        "venueKey": "crocus",
        "industry": "Оборудование для пищевой и перерабатывающей промышленности",
        "confirmed": true,
        "open": "2027-09-28",
        "close": "2027-10-01",
        "setup": "23–27.09.2027",
        "planner": {
          "first_setup_day": "2027-09-23",
          "first_setup_day_basis": "опубликован организатором",
          "comfortable_start": "2027-06-28",
          "standard_start": "2027-08-12",
          "docs_deadline": "2027-09-03",
          "latest_start_without_venue_surcharge": "2027-08-27",
          "express_limit_start": "2027-09-15"
        }
      },
      {
        "id": "provoloka-2027",
        "name": "ПРОВОЛОКА 2027",
        "dates": "май 2027 (точные даты не опубликованы)",
        "venue": "Тимирязев Центр",
        "venueKey": "texpo",
        "industry": "Проволока, метизы, кабельная продукция",
        "confirmed": false,
        "open": null,
        "close": null,
        "setup": null,
        "planner": null
      }
    ],

    /* ---------- Галереи кейсов (только реальные фото ЦРВУ) ---------- */
    cases: {
      "avito": {
        "title": "Avito Auto",
        "meta": "MIMS Automobility 2026",
        "images": [
          {
            "f": "avito-auto-mims-2026-front-left-wide-img3667-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026 с подвешенным автомобилем"
          },
          {
            "f": "avito-auto-mims-2026-suspended-car-front-img3833-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: подвешенный автомобиль крупным планом"
          },
          {
            "f": "avito-auto-mims-2026-reception-car-img3738-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: ресепшн и подвешенный автомобиль"
          },
          {
            "f": "avito-auto-mims-2026-car-rings-hundred-wide-img3991-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: подвесное кольцо с автомобилем над стендом"
          },
          {
            "f": "avito-auto-mims-2026-panorama-img3754-1200",
            "w": 1200,
            "h": 915,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: панорамный вид на ресепшн и подвесную конструкцию"
          },
          {
            "f": "avito-auto-mims-2026-open-interior-img3778-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: вид внутрь стенда"
          },
          {
            "f": "avito-auto-mims-2026-lounge-meeting-img4393-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: лаунж-зона для переговоров"
          },
          {
            "f": "avito-auto-mims-2026-crowded-front-img4332-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: посетители у ресепшн"
          },
          {
            "f": "avito-auto-mims-2026-rear-crowded-img4375-1200",
            "w": 1200,
            "h": 800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: вид со стороны прохода"
          },
          {
            "f": "avito-auto-mims-2026-team-table-img4043-1200",
            "w": 1200,
            "h": 1800,
            "alt": "Стенд Avito Auto на выставке MIMS Automobility 2026: команда на стенде"
          }
        ]
      },
      "intek": {
        "title": "Intek",
        "meta": "Металлообработка 2026",
        "images": [
          {
            "f": "intek-metalworking-2026-front-left-wide-0001-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Intek на выставке Металлообработка 2026"
          }
        ]
      },
      "miratorg": {
        "title": "Мираторг",
        "meta": "FoodExpo Qazaqstan 2025",
        "images": [
          {
            "f": "miratorg-foodexpo-kazakhstan-2025-006-1920",
            "w": 1920,
            "h": 1277,
            "alt": "Стенд Мираторг на выставке FoodExpo Qazaqstan 2025"
          }
        ]
      },
      "alcopack": {
        "title": "ALCOPACK",
        "meta": "Pharmtech 2024",
        "images": [
          {
            "f": "alcopack-pharmtech-2024-front-main-002-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд ALCOPACK на выставке Pharmtech 2024"
          }
        ]
      },
      "decomaster": {
        "title": "Decomaster",
        "meta": "MosBuild 2025",
        "images": [
          {
            "f": "decomaster-mosbuild-2025-corner-002-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Decomaster на выставке MosBuild 2025"
          }
        ]
      },
      "norgau": {
        "title": "NORGAU",
        "meta": "Металлообработка 2026",
        "images": [
          {
            "f": "norgau-metalworking-2026-front-left-002-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд NORGAU на выставке Металлообработка 2026"
          }
        ]
      },
      "europak": {
        "title": "Europak",
        "meta": "TransRussia 2026",
        "images": [
          {
            "f": "europak-transrussia-2026-002-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Europak на выставке TransRussia 2026"
          },
          {
            "f": "europak-transrussia-2026-001-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Europak на выставке TransRussia 2026: общий вид спереди"
          },
          {
            "f": "europak-transrussia-2026-004-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Europak на выставке TransRussia 2026: вид со стороны ресепшн"
          },
          {
            "f": "europak-transrussia-2026-009-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Europak на выставке TransRussia 2026: переговорная зона"
          },
          {
            "f": "europak-transrussia-2026-011-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Europak на выставке TransRussia 2026: лаунж-зона с экраном"
          },
          {
            "f": "europak-transrussia-2026-025-1920",
            "w": 1920,
            "h": 1280,
            "alt": "Стенд Europak на выставке TransRussia 2026: стенд в потоке посетителей"
          }
        ]
      },
      "ekra": {
        "title": "ЭКРА",
        "meta": "МФЭС · Тимирязев Центр",
        "images": [
          {"f": "ekra-mfes-05-1920", "w": 1920, "h": 1280, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре»"},
          {"f": "ekra-mfes-01-1920", "w": 1920, "h": 1280, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 2"},
          {"f": "ekra-mfes-02-1920", "w": 1920, "h": 1280, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 3"},
          {"f": "ekra-mfes-03-1920", "w": 1920, "h": 1279, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 4"},
          {"f": "ekra-mfes-06-1920", "w": 1920, "h": 1280, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 5"},
          {"f": "ekra-mfes-07-1920", "w": 1920, "h": 1279, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 6"},
          {"f": "ekra-mfes-10-1920", "w": 1920, "h": 1279, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 7"},
          {"f": "ekra-mfes-12-1920", "w": 1920, "h": 1280, "alt": "Стенд ЭКРА на форуме «Электрические сети» (МФЭС) в «Тимирязев Центре», фото 8"}
        ]
      },
      "masterkit": {
        "title": "MasterKit",
        "meta": "MIMS Automobility · Экспоцентр",
        "images": [
          {"f": "masterkit-mims-03-1920", "w": 1920, "h": 1280, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре"},
          {"f": "masterkit-mims-01-1920", "w": 1920, "h": 1280, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре, фото 2"},
          {"f": "masterkit-mims-02-1920", "w": 1920, "h": 1279, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре, фото 3"},
          {"f": "masterkit-mims-04-1920", "w": 1920, "h": 1280, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре, фото 4"},
          {"f": "masterkit-mims-05-1920", "w": 1920, "h": 1280, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре, фото 5"},
          {"f": "masterkit-mims-06-1920", "w": 1920, "h": 1916, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре, фото 6"},
          {"f": "masterkit-mims-08-1920", "w": 1920, "h": 1266, "alt": "Стенд MasterKit на выставке MIMS Automobility в Экспоцентре, фото 7"}
        ]
      },
      "quarco": {
        "title": "QUARCO",
        "meta": "Pharmtech & Ingredients · Крокус Экспо",
        "images": [
          {"f": "quarco-pharmtech-01-1920", "w": 1920, "h": 1280, "alt": "Стенд QUARCO на выставке Pharmtech & Ingredients в Крокус Экспо"},
          {"f": "quarco-pharmtech-02-1920", "w": 1920, "h": 1279, "alt": "Стенд QUARCO на выставке Pharmtech & Ingredients в Крокус Экспо, фото 2"},
          {"f": "quarco-pharmtech-03-1920", "w": 1920, "h": 1279, "alt": "Стенд QUARCO на выставке Pharmtech & Ingredients в Крокус Экспо, фото 3"},
          {"f": "quarco-pharmtech-04-1920", "w": 1920, "h": 1280, "alt": "Стенд QUARCO на выставке Pharmtech & Ingredients в Крокус Экспо, фото 4"},
          {"f": "quarco-pharmtech-05-1920", "w": 1920, "h": 1280, "alt": "Стенд QUARCO на выставке Pharmtech & Ingredients в Крокус Экспо, фото 5"},
          {"f": "quarco-pharmtech-08-1920", "w": 1920, "h": 1280, "alt": "Стенд QUARCO на выставке Pharmtech & Ingredients в Крокус Экспо, фото 6"}
        ]
      },
      "uralenergo": {
        "title": "УРАЛЭНЕРГОСЕРВИС",
        "meta": "МФЭС · Тимирязев Центр",
        "images": [
          {"f": "uralenergoservis-mfes-01-1920", "w": 1920, "h": 1280, "alt": "Стенд УРАЛЭНЕРГОСЕРВИС на форуме «Электрические сети» (МФЭС)"},
          {"f": "uralenergoservis-mfes-02-1920", "w": 1920, "h": 1280, "alt": "Стенд УРАЛЭНЕРГОСЕРВИС на форуме «Электрические сети» (МФЭС), фото 2"},
          {"f": "uralenergoservis-mfes-03-1920", "w": 1920, "h": 1280, "alt": "Стенд УРАЛЭНЕРГОСЕРВИС на форуме «Электрические сети» (МФЭС), фото 3"},
          {"f": "uralenergoservis-mfes-04-1920", "w": 1920, "h": 1280, "alt": "Стенд УРАЛЭНЕРГОСЕРВИС на форуме «Электрические сети» (МФЭС), фото 4"},
          {"f": "uralenergoservis-mfes-06-1920", "w": 1920, "h": 1280, "alt": "Стенд УРАЛЭНЕРГОСЕРВИС на форуме «Электрические сети» (МФЭС), фото 5"}
        ]
      },
      "ratsional": {
        "title": "Рационал · Weishaupt",
        "meta": "Aquatherm · Крокус Экспо",
        "images": [
          {"f": "ratsional-aquatherm-01-1920", "w": 1920, "h": 1280, "alt": "Стенд компании «Рационал» на выставке Aquatherm в Крокус Экспо"},
          {"f": "ratsional-aquatherm-04-1920", "w": 1920, "h": 1280, "alt": "Стенд компании «Рационал» на выставке Aquatherm в Крокус Экспо, фото 2"},
          {"f": "ratsional-aquatherm-06-1920", "w": 1920, "h": 1280, "alt": "Стенд компании «Рационал» на выставке Aquatherm в Крокус Экспо, фото 3"}
        ]
      },
      "newline": {
        "title": "Нью Лайн Инжиниринг",
        "meta": "Металлообработка · Экспоцентр",
        "images": [
          {"f": "new-line-metalworking-01-1920", "w": 1920, "h": 1280, "alt": "Стенд «Нью Лайн Инжиниринг» на выставке «Металлообработка» в Экспоцентре"},
          {"f": "new-line-metalworking-02-1920", "w": 1920, "h": 1279, "alt": "Стенд «Нью Лайн Инжиниринг» на выставке «Металлообработка» в Экспоцентре, фото 2"},
          {"f": "new-line-metalworking-03-1920", "w": 1920, "h": 1280, "alt": "Стенд «Нью Лайн Инжиниринг» на выставке «Металлообработка» в Экспоцентре, фото 3"},
          {"f": "new-line-metalworking-05-1920", "w": 1920, "h": 1279, "alt": "Стенд «Нью Лайн Инжиниринг» на выставке «Металлообработка» в Экспоцентре, фото 4"}
        ]
      },
      "atol": {
        "title": "АТОЛ",
        "meta": "CeMAT Russia · Крокус Экспо",
        "images": [
          {"f": "atol-cemat-02-1920", "w": 1920, "h": 1280, "alt": "Стенд АТОЛ на выставке CeMAT Russia в Крокус Экспо"},
          {"f": "atol-cemat-04-1920", "w": 1920, "h": 1280, "alt": "Стенд АТОЛ на выставке CeMAT Russia в Крокус Экспо, фото 2"},
          {"f": "atol-cemat-06-1920", "w": 1920, "h": 1280, "alt": "Стенд АТОЛ на выставке CeMAT Russia в Крокус Экспо, фото 3"}
        ]
      },
      "avtokar": {
        "title": "Автокар · LONKING",
        "meta": "CeMAT Russia · Крокус Экспо",
        "images": [
          {"f": "avtokar-lonking-cemat-02-1920", "w": 1920, "h": 1280, "alt": "Стенд «Автокар» с погрузчиками LONKING на выставке CeMAT Russia"},
          {"f": "avtokar-lonking-cemat-04-1920", "w": 1920, "h": 1280, "alt": "Стенд «Автокар» с погрузчиками LONKING на выставке CeMAT Russia, фото 2"}
        ]
      },
      "erstevak": {
        "title": "Erstevak",
        "meta": "VacuumTechExpo · ВДНХ",
        "images": [
          {"f": "erstevak-vacuumtech-01-1920", "w": 1920, "h": 1280, "alt": "Стенд Erstevak на выставке VacuumTechExpo на ВДНХ"},
          {"f": "erstevak-vacuumtech-05-1920", "w": 1920, "h": 1280, "alt": "Стенд Erstevak на выставке VacuumTechExpo на ВДНХ, фото 2"},
          {"f": "erstevak-vacuumtech-07-1920", "w": 1920, "h": 1280, "alt": "Стенд Erstevak на выставке VacuumTechExpo на ВДНХ, фото 3"}
        ]
      },
      "newtermy": {
        "title": "Новые термы",
        "meta": "MAPIC Russia · Крокус Экспо",
        "images": [
          {"f": "novye-termy-mapic-05-1920", "w": 1920, "h": 1280, "alt": "Стенд группы компаний «Новые термы» на выставке MAPIC Russia"},
          {"f": "novye-termy-mapic-06-1920", "w": 1920, "h": 1280, "alt": "Стенд группы компаний «Новые термы» на выставке MAPIC Russia, фото 2"},
          {"f": "novye-termy-mapic-07-1920", "w": 1920, "h": 1466, "alt": "Стенд группы компаний «Новые термы» на выставке MAPIC Russia, фото 3"},
          {"f": "novye-termy-mapic-08-1920", "w": 1920, "h": 1280, "alt": "Стенд группы компаний «Новые термы» на выставке MAPIC Russia, фото 4"}
        ]
      },
      "aluminstroy": {
        "title": "Алюминстрой",
        "meta": "MosBuild · Крокус Экспо",
        "images": [
          {"f": "aluminstroy-mosbuild-01-1920", "w": 1920, "h": 1280, "alt": "Стенд «Алюминстрой» 45 м² на выставке MosBuild"},
          {"f": "aluminstroy-mosbuild-05-1920", "w": 1920, "h": 1280, "alt": "Стенд «Алюминстрой» 45 м² на выставке MosBuild, фото 2"}
        ]
      }
    }
  };
  var D=w.CRVU_DATA;
  D.calendar={years:[2026,2027],source2026:'https://www.consultant.ru/law/ref/calendar/proizvodstvennye/2026/',source2027:'http://duma.gov.ru/news/64101/',off:['2026-01-09','2026-03-09','2026-05-11','2026-12-31','2027-02-22','2027-05-03','2027-05-10','2027-06-14','2027-11-05','2027-12-31'],working:['2027-02-20']};
})(window);
