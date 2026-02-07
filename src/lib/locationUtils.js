export const LOCATION_TO_COUNTRY = {
    // France
    '파리': 'FR', '리옹': 'FR', '마르세유': 'FR', '니스': 'FR', '보르도': 'FR', '몽펠리에': 'FR', '스트라스부르': 'FR',
    '마레': 'FR', '라데팡스': 'FR', '베르사유': 'FR',

    // Germany
    '베를린': 'DE', '뮌헨': 'DE', '함부르크': 'DE', '프랑크푸르트': 'DE', '슈투트가르트': 'DE', '뒤셀도르프': 'DE', '라이프치히': 'DE',
    '미테': 'DE', '알렉산더': 'DE',

    // UK
    '런던': 'GB', '맨체스터': 'GB', '버밍엄': 'GB', '리버풀': 'GB', '에든버러': 'GB', '글래스고': 'GB',
    '소호': 'GB', '킹스크로스': 'GB', '윔블던': 'GB',

    // Italy
    '로마': 'IT', '밀라노': 'IT', '나폴리': 'IT', '피렌체': 'IT', '베네치아': 'IT', '토리노': 'IT',

    // Spain
    '마드리드': 'ES', '바르셀로나': 'ES', '세비야': 'ES', '발렌시아': 'ES', '그라나다': 'ES',

    // Austria
    '비엔나': 'AT', '빈': 'AT', '잘츠부르크': 'AT', '인스브루크': 'AT',

    // Netherlands
    '암스테르담': 'NL', '로테르담': 'NL', '헤이그': 'NL', '위트레흐트': 'NL',

    // Hungary
    '부다페스트': 'HU', '데브레첸': 'HU',

    // Czech
    '프라하': 'CZ', '브르노': 'CZ',

    // Poland
    '바르샤바': 'PL', '크라쿠프': 'PL', '브로츠와프': 'PL', '그단스크': 'PL'
};

/**
 * 입력된 위치 텍스트에서 국가 코드를 추출합니다.
 * @param {string} location 
 * @param {string} fallbackCode 
 * @returns {string} country_code
 */
export const getCountryCodeFromLocation = (location, fallbackCode = 'ALL') => {
    if (!location) return fallbackCode;

    const normalized = location.replace(/\s+/g, '');

    for (const [key, code] of Object.entries(LOCATION_TO_COUNTRY)) {
        if (normalized.includes(key)) {
            return code;
        }
    }

    return fallbackCode;
};
