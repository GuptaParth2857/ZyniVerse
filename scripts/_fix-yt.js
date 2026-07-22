// Verified valid YouTube IDs only
const VALID_YT_IDS = new Set([
  "lj6tjz5VkQM", "TApFCt9m0ug", "hUrjWzmBMRg", "sV5R6Fyp31M",
  "X4SViWkqHSM", "-bCTlrXlnTM", "23GCn7QaQ18",
  "sKu3LjLW4CQ", "juuyQNZumOw",
  "BBxgzISkCLQ", "s2JcedFF5RQ", "iwiP3P0Upnk",
  "PbWFpzi8C94", "OBqw818mQ1E", "cQbDvCqbPno",
  "K9kwGVuYtPw", "LKP-vZvjbh8", "f1vheBGpC_o", "odm6a02VhO8",
  "44IK60CRGw8", "6c3dEwyfhAU", "zVgKnfN9i34",
  "nAKieoaRKH4",
  "G8CFuZ9MseQ",
  "gdZLi9oWNZg",
  "5MMWudM0420",
  "2OEL4P1Rz04",
  "YoeP9w5UIlg", "GwaRztMaoY0", "8OkpRK2_gVs",
  "EBNl8bwdVcA", "QImBolnTVH8", "qQmTdijhjD4",
  "GJ4yehnerHQ", "w5OUAY1j3gQ", "udNgJUiBCRg",
  "dlFA0Zq1k2A", "qpi9YXaChHI", "og0KAkYb0cU",
  "o2Dw_lf3JMg",
]);

const fs = require("fs");
const path = require("path");

const themesPath = path.join(__dirname, "../src/lib/data/themes.ts");
let content = fs.readFileSync(themesPath, "utf-8");

let removed = 0;
let kept = 0;

// Find all youtubeId assignments and remove invalid ones
content = content.replace(/youtubeId: "([^"]+)"/g, (match, id) => {
  if (VALID_YT_IDS.has(id)) {
    kept++;
    return match;
  }
  removed++;
  return "/* youtubeId removed (invalid) */";
});

// Clean up the "/* youtubeId removed (invalid) */" entries — remove the whole comma+youtubeId part
content = content.replace(/, \/\/ youtubeId removed \(invalid\)/g, "");

fs.writeFileSync(themesPath, content);
console.log(`Kept: ${kept} valid IDs, Removed: ${removed} invalid IDs`);
