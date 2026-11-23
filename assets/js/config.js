/* Настройки рабочего сайта ЦРВУ.
   Яндекс Метрика, Varioqub, UIS и приём заявок включаются только на productionOrigin
   (и на закрытом тесте testOrigin). На любой другой копии страницы счётчики не загружаются,
   а формы предлагают позвонить или написать в мессенджер.
   Цены калькулятора — документ «Цены для калькулятора ЦРВУ» от 19.11.2026. */
window.CRVU_CONFIG = {
  productionOrigin: 'https://stendy.crvu.ru',
  testOrigin: 'https://test.crvu.ru',
  leadEndpoint: '/api/v1/leads',
  leadTimeoutMs: 45000,
  policyUrl: 'https://crvu.ru/policy',
  policyVersion: 'privacy-2026-09-09',
  testPolicyVersion: 'closed-email-test-2026-09',
  metrikaId: 103630235,
  uisKey: 'qg24QyCYud5Mu4I97rtfvFfWZ3iS4izk',
  pricingVerified: true,
  /* Окно с бонусами при попытке уйти со страницы. Если дата прошла, срок переносится
     на последний день текущего месяца. */
  exitBonus: { until: '2026-11-30', delayMs: 120000 }
};
