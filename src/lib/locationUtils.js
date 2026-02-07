/**
 * 지명/도시명을 기반으로 국가 코드를 반환하는 유틸리티
 */
export const getCountryCodeFromLocation = (location = '') => {
    if (!location) return null;

    const loc = location.toLowerCase();

    // 프랑스 주요 지역
    if (loc.includes('파리') || loc.includes('paris') || loc.includes('리옹') || loc.includes('마르세유') || loc.includes('니스')) {
        return 'FR';
    }

    // 독일 주요 지역
    if (loc.includes('베를린') || loc.includes('berlin') || loc.includes('프랑크푸르트') || loc.includes('frankfurt') || loc.includes('뮌헨') || loc.includes('munich') || loc.includes('함부르크')) {
        return 'DE';
    }

    // 영국 주요 지역
    if (loc.includes('런던') || loc.includes('london') || loc.includes('맨체스터') || loc.includes('manchester') || loc.includes('버밍엄')) {
        return 'GB';
    }

    // 이탈리아 주요 지역
    if (loc.includes('로마') || loc.includes('rome') || loc.includes('밀라노') || loc.includes('milan') || loc.includes('피렌체')) {
        return 'IT';
    }

    // 헝가리 주요 지역
    if (loc.includes('부다페스트') || loc.includes('budapest')) {
        return 'HU';
    }

    // 체코 주요 지역
    if (loc.includes('프라하') || loc.includes('prague')) {
        return 'CZ';
    }

    // 폴란드 주요 지역
    if (loc.includes('바르샤바') || loc.includes('warsaw') || loc.includes('크라쿠프')) {
        return 'PL';
    }

    return null;
};
