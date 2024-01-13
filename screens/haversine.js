function toRadians(degrees) {
    return degrees * Math.PI / 180;
 }
 
 export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
 
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 
    let distance = R * c; // Distance in kilometers
 
    // Round to the nearest 0.1 km
    distance = Math.round(distance * 10) / 10;
 
    // If distance is 0, return '<1 km'
    if (distance <= 1) {
        return '<1';
    }
 
    return distance;
 }
 