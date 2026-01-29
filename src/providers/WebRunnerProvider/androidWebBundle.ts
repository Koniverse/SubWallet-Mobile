import * as RNFS from '@dr.pogodin/react-native-fs';

export const copyAndroidWebBundle = async (bundleName: string) => {
  const destRoot = `${RNFS.DocumentDirectoryPath}/${bundleName}/site`;

  await RNFS.mkdir(destRoot);

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

  await copyDir(`${bundleName}/site`, destRoot);
}