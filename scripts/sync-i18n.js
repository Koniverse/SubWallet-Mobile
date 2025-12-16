const fs = require('fs');
const path = require('path');

const I18N_DIR = path.resolve(__dirname, '../src/utils/i18n');

const SOURCE_FILE = 'en_US.json';
const TARGET_FILES = [
  'vi_VN.json',
  'zh_CN.json',
  'ru_RU.json',
  'ja_JP.json'
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2) + '\n',
    'utf8'
  );
}

/**
 * Chỉ thêm key còn thiếu
 * Giữ nguyên value tiếng Anh
 * Không ghi đè value đã tồn tại
 */
function mergeMissingKeys(source, target) {
  let changed = false;

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    // Key chưa tồn tại → copy từ en_US
    if (targetValue === undefined) {
      target[key] = sourceValue;
      changed = true;
      return;
    }

    // Cả hai đều là object → merge đệ quy
    if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      if (mergeMissingKeys(sourceValue, targetValue)) {
        changed = true;
      }
    }
  });

  return changed;
}

function syncI18n() {
  const sourceData = readJson(path.join(I18N_DIR, SOURCE_FILE));

  TARGET_FILES.forEach((file) => {
    const targetPath = path.join(I18N_DIR, file);
    const targetData = readJson(targetPath);

    if (mergeMissingKeys(sourceData, targetData)) {
      writeJson(targetPath, targetData);
      console.log(`✔ Synced → ${file}`);
    } else {
      console.log(`– No changes → ${file}`);
    }
  });
}

syncI18n();