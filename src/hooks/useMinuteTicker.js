import { useEffect, useState } from 'react';

const ONE_MINUTE = 60 * 1000;

export const useMinuteTicker = () => {
    const [nowMs, setNowMs] = useState(() => Date.now());

    useEffect(() => {
        let intervalId;
        const tick = () => setNowMs(Date.now());
        const delayToNextMinute = ONE_MINUTE - (Date.now() % ONE_MINUTE);

        const timeoutId = setTimeout(() => {
            tick();
            intervalId = setInterval(tick, ONE_MINUTE);
        }, delayToNextMinute);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

    return nowMs;
};

export default useMinuteTicker;
