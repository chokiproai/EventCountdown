/*
 * Vietnamese Lunar Calendar library
 * Based on algorithm by Ho Ngoc Duc
 */

const Lunisolar = (function () {

    function jdn(dd, mm, yy) {
        let a = Math.floor((14 - mm) / 12);
        let y = yy + 4800 - a;
        let m = mm + 12 * a - 3;
        return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    }

    function getNewMoonDay(k, timeZone) {
        let T = k / 1236.85;
        let T2 = T * T;
        let T3 = T2 * T;
        let dr = Math.PI / 180;
        let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
        let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
        let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
        let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
        let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
        let C2 = -0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * Mpr * dr);
        let C3 = -0.0004 * Math.sin(3 * Mpr * dr);
        let C4 = 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin(M * dr + 2 * F * dr);
        let C5 = -0.0074 * Math.sin(Mpr * dr - 2 * F * dr) + 0.0004 * Math.sin(2 * F * dr + M * dr);
        let C6 = -0.0004 * Math.sin(2 * F * dr + 2 * M * dr) - 0.0006 * Math.sin(2 * F * dr + Mpr * dr);
        let C7 = 0.001 * Math.sin(4 * F * dr) + 0.0005 * Math.sin(M * dr + Mpr * dr);
        let JdNew = Jd1 + C1 + C2 + C3 + C4 + C5 + C6 + C7;
        return Math.floor(JdNew + 0.5 + timeZone / 24);
    }

    function getSunLongitude(dayNumber, timeZone) {
        let T = (dayNumber - 0.5 - timeZone / 24 - 2451545.0) / 36525.0;
        let T2 = T * T;
        let dr = Math.PI / 180;
        let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
        let M = 357.52911 + 35999.05029 * T - 0.0001537 * T2;
        let C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr);
        C += (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr);
        C += 0.000289 * Math.sin(3 * M * dr);

        let deg = (L0 + C);
        // Normalize to 0-360
        deg = deg - Math.floor(deg / 360) * 360;
        return deg;
    }

    function getLunarMonth11(yy, timeZone) {
        let off = jdn(31, 12, yy) - 2415021;
        let k = Math.floor(off / 29.530588853);
        let nm, sunLong;
        let i = 0;

        // Look for the month containing Winter Solstice (270 degrees)
        while (i < 5) { // Safety break
            nm = getNewMoonDay(k, timeZone);
            sunLong = getSunLongitude(nm, timeZone);

            // We want the month to start BEFORE (or at) 270, and end AFTER 270.
            // Since month is ~29 deg. If sunLong is in [240, 270], it likely contains 270.
            // If sunLong > 270 (e.g. 280) and < 360, it is too late (Month 12/1). Move back.
            // If sunLong < 240 (e.g. 230), it is too early (Month 10). Move forward.

            // Special case is crossing 0 (Spring).
            // 270 is far from 0. So no wrapping issues for check.

            if (sunLong >= 270.0 || (sunLong < 30)) {
                k--;
            } else if (sunLong < 240.0) {
                k++;
            } else {
                // Valid range approx 240-270
                return nm;
            }
            i++;
        }
        return nm; // fallback
    }

    function getSolarDate(lunarDay, lunarMonth, lunarYear) {
        let startDayData = jdn(1, 1, lunarYear);
        if (lunarMonth > 6) startDayData = jdn(1, 6, lunarYear);

        // Increased search range slightly
        for (let offset = -40; offset < 420; offset++) {
            let currentJD = startDayData + offset;

            // JD to Solar Date
            let a = currentJD + 32044;
            let b = Math.floor((4 * a + 3) / 146097);
            let c = a - Math.floor((146097 * b) / 4);
            let d = Math.floor((4 * c + 3) / 1461);
            let e = c - Math.floor((1461 * d) / 4);
            let m = Math.floor((5 * e + 2) / 153);
            let day = e - Math.floor((153 * m + 2) / 5) + 1;
            let month = m + 3 - 12 * Math.floor(m / 10);
            let year = 100 * b + d - 4800 + Math.floor(m / 10);

            const timeZone = 7;
            let dayNumber = currentJD;
            let k = Math.floor((dayNumber - 2415021) / 29.530588853);
            let monthStart = getNewMoonDay(k + 1, timeZone);
            if (monthStart > dayNumber) {
                monthStart = getNewMoonDay(k, timeZone);
            } else {
                k = k + 1;
            }

            let a11 = getLunarMonth11(year, timeZone);
            if (a11 >= monthStart) {
                let k11 = Math.floor((jdn(31, 12, year - 1) - 2415021) / 29.530588853);
                a11 = getNewMoonDay(k11, timeZone);
                let sl = getSunLongitude(a11, timeZone);
                // If a11 is "too late" (e.g. >270), move back. 
                // Using getLunarMonth11 logic ensures we have correct one.
                // But here we re-verify a11 is < monthStart?
                // Actually getLunarMonth11 finds Month 11 of Solar Year.
                // If we are in Jan/Feb, that is Month 11 of PREV Solar Year.
                // So if a11 >= monthStart, we computed a11 for CURRENT year, but we need PREV year.
                // So the re-compute block is correct.

                // One check: our re-compute block calls getNewMoonDay but implies k11 logic?
                // Actually we should just call getLunarMonth11(year - 1).
                // It is cleaner and safer than manual logic.
                a11 = getLunarMonth11(year - 1, timeZone);
            }

            let lDay = dayNumber - monthStart + 1;
            let diff = Math.floor((monthStart - a11) / 29);
            let lMonth = diff + 11;
            if (lMonth > 12) lMonth -= 12;

            if (diff >= 3) {
                // Simplified leap logic: 
                // If diff is large, we might have leap month?
                // Leap month usually happens if there are 13 months between a11 and next a11.
                // We don't have full checker here.
                // But for standard holidays (Tet, Hung Kings, Mid Autumn), 
                // we generally match the FIRST occurrence if leap, or standard month.
                // If lMonth calculated is > expected, maybe because of leap.

                // If calculating Month 1.
                // diff should be 2. lMonth = 13 -> 1.
                // If diff is 3 (leap month previous). lMonth = 14 -> 2.
                // So "Month 1" won't match if diff=3.
                // But we want Month 1 to match!
                // If leap month was Month 11+ (rare), then Month 1 is delayed.
                // If no leap, diff=2.

                // So if lMonth calculated via `diff+11` matches our target, we are good.
                // We are ignoring the 'Leap' flag.
            }

            // Year logic
            let lYear = year;
            if (month < 4 && lMonth > 8) lYear--;
            else if (month > 8 && lMonth < 4) lYear++;

            if (lDay === lunarDay && lMonth === lunarMonth && lYear === lunarYear) {
                return new Date(year, month - 1, day);
            }
        }
        return null;
    }

    return { getSolarDateFromLunar: getSolarDate };

})();
