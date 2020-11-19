"use strict";

const CardsRegExp = /\[(Red|Blue|Green|Yellow|Wild DrawFour|Wild)(.[0-9]|.D2|.Reverse|.Skip||)\]/g;

function findCards(text) {
	const result = [];

	let match;

	while ((match = CardsRegExp.exec(text))) {
		result.push({
			start: match.index,
			end: match.index + match[0].length,
			color: match[1],
			number: match[2],
		});
	}

	return result;
}

export default findCards;
