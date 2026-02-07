/**
 * 유럽 11개국 및 한인 밀집 지역(District) 상세 데이터
 */
export const CITY_DISTRICTS = {
    'FR': {
        name: '프랑스',
        cities: [
            { name: '파리', districts: ['15구 (Little Korea)', '13구', '14구', '16구', '8구 (Champ-Élysées)', '1구 (Pyramides/Opera)', 'Boulogne-Billancourt', 'Neuilly-sur-Seine'] },
            { name: '리옹', districts: ['City Center', 'Villeurbanne', '6th Arr.'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'DE': {
        name: '독일',
        cities: [
            { name: '프랑크푸르트', districts: ['Frankfurt City', 'Oberursel (한인 밀집)', 'Schwalbach', 'Sulzbach', 'Eschborn', 'Bad Homburg'] },
            { name: '베를린', districts: ['Mitte', 'Charlottenburg', 'Steglitz-Zehlendorf', 'Prenzlauer Berg', 'Schöneberg'] },
            { name: '뒤셀도르프', districts: ['Oststraße (Little Seoul)', 'Pempelfort', 'Oberkassel', 'Heerdt'] },
            { name: '뮌헨', districts: ['City Center', 'Schwabing', 'Maxvorstadt'] },
            { name: '함부르크', districts: ['Altona', 'Eimsbüttel', 'Wandsbek'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'GB': {
        name: '영국',
        cities: [
            { name: '런던', districts: ['New Malden (Koreatown)', 'Kingston', 'Richmond', 'Wimbledon', 'Golders Green', 'Camden', 'Canary Wharf', 'South Kensington'] },
            { name: '맨체스터', districts: ['City Center', 'Salford', 'Didsbury'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'HU': {
        name: '헝가리',
        cities: [
            { name: '부다페스트', districts: ['2구 (Budai-Old)', '11구 (Újbuda)', '12구 (Hegyvidék)', '10구 (Kőbánya - Asian Hub)', '3구 (Óbuda)', '5구 (Belváros)', '13구 (Angyalföld)'] },
            { name: '데브레첸', districts: ['City Center', 'Nagyerdő'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'AT': {
        name: '오스트리아',
        cities: [
            { name: '비엔나', districts: ['1구 (City Center)', '22구 (Kagran - UN area)', '15구 (한인 거주)', '19구 (Döbling)', '2구 (Leopoldstadt)'] },
            { name: '잘츠부르크', districts: ['Altstadt', 'Elisabeth-Vorstadt'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'CZ': {
        name: '체코',
        cities: [
            { name: '프라하', districts: ['Prague 1 (Center)', 'Prague 4 (한인 밀집)', 'Prague 6 (주변 거주)', 'Prague 2 (Vinohrady)', 'Prague 5 (Smíchov)'] },
            { name: '브르노', districts: ['City Center', 'Brno-střed'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'PL': {
        name: '폴란드',
        cities: [
            { name: '바르샤바', districts: ['Centrum', 'Mokotów (한인 거주)', 'Wilanów', 'Ochota', 'Białołęka'] },
            { name: '브로츠와프', districts: ['City Center', 'Bielany Wrocławskie (한인 밀집)', 'Krzyki'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'NL': {
        name: '네덜란드',
        cities: [
            { name: '암스테르담', districts: ['Zuid (Buitenveldert)', 'Centrum', 'West', 'Oost'] },
            { name: '암스텔베인', districts: ['Center', 'Westwijk', 'Middenhoven'] },
            { name: '로테르담', districts: ['City Center', 'Kop van Zuid'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'IT': {
        name: '이탈리아',
        cities: [
            { name: '밀라노', districts: ['City Center', 'Loreto', 'Navigli', 'Porta Nuova'] },
            { name: '로마', districts: ['City Center', 'Nomentana', 'Vittorio Emanuele'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    },
    'ES': {
        name: '스페인',
        cities: [
            { name: '마드리드', districts: ['City Center', 'Plaza de España area', 'Arganzuela', 'Fuencarral'] },
            { name: '바르셀로나', districts: ['Eixample', 'Gràcia', 'Sant Martí'] },
            { name: '기타', districts: ['직접 입력'] }
        ]
    }
};

export const LOCATION_TO_COUNTRY = {
    '파리': 'FR', '리옹': 'FR', '몽펠리에': 'FR',
    '베를린': 'DE', '프랑크푸르트': 'DE', '뒤셀도르프': 'DE',
    '런던': 'GB', '맨체스터': 'GB',
    '부다페스트': 'HU',
    '비엔나': 'AT',
    '프라하': 'CZ',
    '바르샤바': 'PL', '브로츠와프': 'PL',
    '암스테르담': 'NL', '암스텔베인': 'NL',
    '로마': 'IT', '밀라노': 'IT',
    '마드리드': 'ES', '바르셀로나': 'ES'
};

export const getCountryCodeFromLocation = (location, fallbackCode = 'ALL') => {
    if (!location) return fallbackCode;
    const normalized = location.replace(/\s+/g, '');
    for (const [key, code] of Object.entries(LOCATION_TO_COUNTRY)) {
        if (normalized.includes(key)) return code;
    }
    return fallbackCode;
};
