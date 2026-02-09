import { useEffect, useState } from 'react';

const ONE_MINUTE = 60 * 1000;

export const useMinuteTicker = () => {
    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => {
        let intervalId;
        const tick = () => setNowMs(Date.now());
        const delayToNextMinute = ONE_MINUTE - (Date.now() % ONE_MINUTE);

        const timeoutId = window.setTimeout(() => {
            tick();
            intervalId = window.setInterval(tick, ONE_MINUTE);
        }, delayToNextMinute);

        return () => {
            window.clearTimeout(timeoutId);
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, []);

    return nowMs;
};

export default useMinuteTicker;
