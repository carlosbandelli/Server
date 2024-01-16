"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertMinutesToHourString = convertMinutesToHourString;
function convertMinutesToHourString(minutesAmount) {
  const hours = Math.floor(minutesAmount / 60);
  const minutes = minutesAmount % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}