export const math_roundToDecimal = (value: number, decimalPlaces: number = 2) => {
	return Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
};

