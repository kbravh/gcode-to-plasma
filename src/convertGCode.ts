const startGCode: string[] = ['G20', 'G91', 'M62'];

const M03_s = 'M03 S255';
const M03_r = 'M07';
const M05_s = 'M05';
const M05_r = 'M08';
const F0_s = 'F0';
const F0_r = ' ';
const Layer_s = '; Layer C00';
const Layer_r = `G90
G0 Z1.875
G0 Z.375
G91`;

export const convertGCodeToPlasma = (code: string): string => {
  // remove first 10 lines
  code = code.split('\n').slice(10).join('\n');

  //Deletes M8's, deletes F0's, changes M03 S255 to M07, M05 to M08
  code = code.replaceAll(M03_s, M03_r);
  code = code.replaceAll(M05_s, M05_r);
  code = code.replaceAll(F0_s, F0_r);
  code = code.replaceAll(Layer_s, Layer_r);
  //Adds startGCode
  code = startGCode.join('\n') + '\n' + code;
  return code;
};

export const createDownloadUri = (code: string): string => {
  const blob = new Blob([code]);
  const downloadUri = URL.createObjectURL(blob);
  return downloadUri;
};
