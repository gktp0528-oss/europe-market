/**
 * 날짜 및 시간 관련 유틸리티 함수
 */

/**
 * 날짜를 '방금 전', 'n분 전', 'n시간 전', 'n일 전' 형식으로 변환
 * @param {string | Date} dateValue - 변환할 날짜
 * @returns {string} 변환된 상대 시간 문자열
 */
export const formatTimeAgo = (dateValue) => {
    if (!dateValue) return '방금 전';

    const now = new Date();
    const date = new Date(dateValue);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return '방금 전';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    // 7일 이상은 날짜 표시
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
