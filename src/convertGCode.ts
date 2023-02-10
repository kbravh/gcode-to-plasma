import {BlobWriter, TextReader, ZipWriter} from '@zip.js/zip.js';
import { FileWrapper } from './pages';

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


export const convertGcodeFileToPlasmaFile = async (file: FileWrapper): Promise<FileWrapper> => {
  const text = await file.file.text()
  const code = convertGCodeToPlasma(text)
  return {
    ...file,
    text: code,
    uri: createDownloadUri(code)
  }
}

export const convertAndZip = async (files: FileWrapper[]): Promise<string> => {
  const zipWriter = new ZipWriter(new BlobWriter());
  for (const file of files) {
    if (!file.text) {
      throw new Error('File does not have converted code')
    }
    const reader = new TextReader(file.text);
    zipWriter.add(`plasma_${file.file.name}`, reader);
  }
  const blob = await zipWriter.close();
  const uri = URL.createObjectURL(blob);
  return uri;
};

export const createDownloadUri = (code: string): string => {
  const blob = new Blob([code]);
  const downloadUri = URL.createObjectURL(blob);
  return downloadUri;
};
