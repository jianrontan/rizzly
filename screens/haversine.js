function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = toRadians(Math.abs(lat2 - lat1));
    const dLon = toRadians(Math.abs(lon2 - lon1));

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    let distance = R * c;

    distance = Math.round(distance * 10) / 10;

    if (distance <= 1) {
        return '<1';
    }

    return distance;
}
