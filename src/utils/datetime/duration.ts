import { Duration } from 'luxon';

export function formatDuration(duration: Duration) {
    if (duration.hours !== 0) {
        return duration.minutes !== 0 ? duration.toFormat("h 'hr' m 'min'") : duration.toFormat("h 'hr'");
    }
    return duration.toFormat("m 'min'");
}
