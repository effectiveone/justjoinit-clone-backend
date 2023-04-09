// helpers/cleanData.js

const { escape } = require("validator");

function cleanData(data) {
  const cleanedData = { ...data };
  for (const key in cleanedData) {
    if (typeof cleanedData[key] === "string") {
      cleanedData[key] = escape(cleanedData[key]);
    }
  }
  return cleanedData;
}

module.exports = cleanData;
