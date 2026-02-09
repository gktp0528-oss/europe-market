export const getPostTimeLabel = (item, nowTick) => {
    if (!item || !item.created_at) return '';

    const created = new Date(item.created_at);
    const now = new Date();
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return created.toLocaleDateString();
};
