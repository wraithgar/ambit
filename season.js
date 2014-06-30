// Calculate initial guess as the Julian date
function calculateJulian(season, year) { //valid for years 1000 AD through 3000 AD
    var Y = (year - 2000) / 1000;
    if (season === 0) {
        return 2451623.80984 + 365242.37404 * Y + 0.05169 * Math.pow(Y, 2) - 0.00411 * Math.pow(Y, 3) - 0.00057 * Math.pow(Y, 4);
    }
    if (season === 1) {
        return 2451716.56767 + 365241.62603*Y + 0.00325 * Math.pow(Y, 2) + 0.00888 * Math.pow(Y, 3) - 0.00030 * Math.pow(Y, 4);
    }
    if (season === 2) {
        return 2451810.21715 + 365242.01767*Y - 0.11575 * Math.pow(Y, 2) + 0.00337 * Math.pow(Y, 3) + 0.00078 * Math.pow(Y, 4);
    }
    if (season === 3) {
        return 2451900.05952 + 365242.74049*Y - 0.06223 * Math.pow(Y, 2) - 0.00823 * Math.pow(Y, 3) + 0.00032 * Math.pow(Y, 4);
    }
    return 0;
}

function calculateLongitude(t) {
    var a = new Array(485, 203,199,182,156,136,77,74,70,58,52,50,45,44,29,18,17,16,14,12,12,12,9,8);
    var b = new Array(324.96, 337.23,342.08,27.85,73.14,171.52,222.54,296.72,243.58,119.81,297.17,21.02,
            247.54, 325.15,60.93,155.12,288.79,198.04,199.76,95.39,287.11,320.81,227.73,15.45);
    var c = new Array(1934.136, 32964.467,20.186,445267.112,45036.886,22518.443,
            65928.934, 3034.906,9037.513,33718.147,150.678,2281.226,
            29929.562, 31555.956,4443.417,67555.328,4562.452,62894.029,
            31436.921, 14577.848,31931.756,34777.259,1222.114,16859.074);
    var s = 0;
    for( var i=0; i<24; i++ ) { s += a[i] * Math.cos((b[i] + (c[i]*t) * Math.PI / 180)); }
    return s;
}

//TODO this feels like it could be cleaned up
function juliantoUTC(jd) {
    var year, month, day, hour, minute, second, tmp;
    var julianInteger  = Math.floor(jd);
    var julianFrac = jd - julianInteger;
    if( julianInteger >= 2299161 ) {
        tmp = Math.floor( ( (julianInteger - 1867216) - 0.25 ) / 36524.25 );
		julianInteger = julianInteger + 1 + tmp - Math.floor(0.25*tmp);
	} else {
		julianInteger = julianInteger;
    }

	//correction for half day offset
	var dayfrac = julianFrac + 0.5;
	if( dayfrac >= 1.0 ) {
		dayfrac -= 1.0;
        julianInteger = julianInteger + 1;
	}

	julianInteger = julianInteger + 1524;
	year = Math.floor( 6680.0 + ( (julianInteger - 2439870) - 122.1 )/365.25 );
	day = Math.floor(year*365.25);
	month = Math.floor( (julianInteger - day)/30.6001 );

	day = Math.floor(julianInteger - day - Math.floor(month*30.6001));
	month = Math.floor(month - 1);
	if( month > 12 ) {
        month = month - 12;
    }
	year = Math.floor(year - 4715);
	if( month > 2 ) {
        year = year - 1;
    }
	if( year <= 0 ) {
        year = year - 1;
    }

	hour  = Math.floor(dayfrac * 24.0);
	minute  = Math.floor((dayfrac * 24.0 - hour) * 60.0);
    tmp = ((dayfrac * 24.0 - hour) * 60.0 - minute) * 60.0;
	second  = Math.floor(tmp);
    tmp = tmp = second;
    if( tmp > 0.5 ) {
        second = second + 1;
    }

    return new Date(year, month - 1, day, hour, minute, second);
}

//Season is 0-3
function calculateSeason(season, year) {
    var t, w, dl, longitude;
    var julian;
    //Calculate Julian Date of solar quarter
    if (year < 1000 || year > 3000) { //No thanks
        return;
    }
    if (season < 0 || season > 3) { //Invalid season
        return;
    }
    julian = calculateJulian(season, year);
    t = ( julian - 2451545.0) / 36525;
    w = 35999.373 * t - 2.47;
    dl = 1 + 0.0334 * Math.cos(w * Math.PI / 180) + 0.0007 * Math.cos(w * Math.PI / 90);
    longitude = calculateLongitude( t );
    julian = julian + ( (0.00001 * longitude) / dl );
    return juliantoUTC(julian);
}

module.exports = calculateSeason;
