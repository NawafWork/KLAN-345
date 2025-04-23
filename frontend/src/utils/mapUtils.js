export const isValidCoordinates = (lat, lng) => {
    return (
        lat !== null &&
        lng !== null &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 && 
        lat <= 90 &&
        lng >= -180 && 
        lng <= 180
    );
};