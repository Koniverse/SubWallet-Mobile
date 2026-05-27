import * as RNFS from '@dr.pogodin/react-native-fs';

export const copyAndroidWebBundle = async (bundleName: string) => {
  const destBundleRoot = `${RNFS.DocumentDirectoryPath}/${bundleName}`;
  const tempBundleRoot = `${RNFS.DocumentDirectoryPath}/${bundleName}.tmp`;
  const tempRoot = `${tempBundleRoot}/site`;

  if (await RNFS.exists(tempBundleRoot)) {
    await RNFS.unlink(tempBundleRoot);
  }

  await RNFS.mkdir(tempRoot);

  const copyDir = async (assetPath: string, destPath: string) => {
    const items = await RNFS.readDirAssets(assetPath);

    for (const item of items) {
      const target = `${destPath}/${item.name}`;

      if (item.isFile()) {
        await RNFS.copyFileAssets(`${assetPath}/${item.name}`, target);
      } else {
        await RNFS.mkdir(target);
        await copyDir(`${assetPath}/${item.name}`, target);
      }
    }
  };

  await copyDir(`${bundleName}/site`, tempRoot);

  if (await RNFS.exists(destBundleRoot)) {
    await RNFS.unlink(destBundleRoot);
  }

  await RNFS.moveFile(tempBundleRoot, destBundleRoot);
};
