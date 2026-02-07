import { supabase } from './supabase';

/**
 * 오늘 날짜의 TOP 10 스냅샷을 생성하거나 업데이트합니다.
 * 백엔드 Cron Job을 대신하여 클라이언트에서 호출하거나 테스트용으로 사용됩니다.
 */
export const updateTop10Snapshot = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const countries = ['ALL', 'FR', 'DE', 'GB', 'NL', 'IT', 'AT', 'HU', 'CZ'];

    console.log(`[Aggregation] Starting TOP 10 snapshot generation for ${dateStr}...`);

    try {
        // 1. 오늘 생성된 모든 게시물 가져오기
        // 실제로는 데이터가 많으면 페이지네이션이나 서버 사이드 로직이 필요하지만, 로컬 테스트용으로는 fetch all
        const startOfDay = new Date(dateStr).toISOString();
        const endOfDay = new Date(new Date(dateStr).setHours(23, 59, 59, 999)).toISOString();

        const { data: posts, error: fetchError } = await supabase
            .from('posts')
            .select('*')
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay);

        if (fetchError) throw fetchError;

        // 2. 국가별 루프 및 집계
        for (const country of countries) {
            let filteredPosts = posts;
            if (country !== 'ALL') {
                filteredPosts = posts.filter(p => p.country_code === country);
            }

            // 조회수 내림차순 정렬 & 상위 10개
            const top10 = filteredPosts
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            // JSON 데이터 구조 최적화 (필요한 필드만 저장)
            const simplifiedTop10 = top10.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                location: item.location,
                time: item.time_ago, // or calculate from created_at
                color: item.color,
                country: item.country_code,
                category: item.category,
                views: item.views,
                likes: item.likes
            }));

            // 3. 스냅샷 테이블에 저장 (Upsert)
            const { error: upsertError } = await supabase
                .from('popular_snapshots')
                .upsert({
                    snapshot_date: dateStr,
                    country_code: country,
                    top_items: simplifiedTop10,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'snapshot_date, country_code'
                });

            if (upsertError) {
                console.error(`[Aggregation] Failed to upsert for ${country}:`, upsertError);
            } else {
                console.log(`[Aggregation] Successfully updated ${country} TOP 10 (${simplifiedTop10.length} items)`);
            }
        }

        return { success: true, message: 'Snapshot updated successfully' };

    } catch (error) {
        console.error('[Aggregation] Critical error:', error);
        return { success: false, error };
    }
};
