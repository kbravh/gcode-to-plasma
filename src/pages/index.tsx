import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { convertGCodeToPlasma, createDownloadUri } from '../convertGCode';
import { AnimatePresence, motion } from 'framer-motion';

enum AppStates {
  initial = 'initial',
  uploading = 'uploading',
  uploaded = 'uploaded',
  converted = 'converted',
}
type AppState = keyof typeof AppStates;

const Home: NextPage = () => {
  const [text, setText] = useState<string>('');
  const [state, setState] = useState<AppState>('initial');
  const [file, setFile] = useState<File | undefined>();
  const [uri, setUri] = useState<string>();

  useEffect(() => {
    const readFile = async () => {
      if (!file) return;
      const code = await file.text();
      setText(code);
      setState('uploaded');
    };
    readFile();
  }, [file]);

  const handleConvert = () => {
    const code = convertGCodeToPlasma(text);
    setText(code);
    const uri = createDownloadUri(code);
    setUri(uri);
    setState('converted');
  };

  return (
    <>
      <Head>
        <title>G-Code to Plasma</title>
        <meta name="description" content="Convert G-Code to be plasma cutter compatible." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen max-h-screen flex flex-col items-center">
        <header className="container mx-auto flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
            G-Code to <span className="bg-gradient-to-br bg-clip-text from-red-500 to-purple-400 text-transparent">Plasma</span>
          </h1>
        </header>
        <div className="flex flex-col items-center">
          <div className="p-4 flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col items-center">
              <label htmlFor="file">Upload{state !== 'initial' && ' another'} G-Code file:</label>
              <input
                name="file"
                type="file"
                accept=".nc"
                onChange={(e) => {
                  setFile(e.target.files?.[0]);
                  setState('uploading');
                }}
                className={`ml-3 inline-flex items-center rounded border border-transparent ${state === 'initial' ? 'bg-slate-600' : 'bg-slate-200'} px-2.5 py-1.5 text-xs font-medium ${state === 'initial' ? 'text-white' : 'text-slate-600'} shadow-sm ${
                  state === 'initial' ? 'hover:bg-slate-800' : 'bg-slate-400'
                } focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2`}
              />
            </div>
            <AnimatePresence mode='wait'>
              {state === 'uploaded' && (
                <motion.button
                  key='convert'
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  onClick={handleConvert}
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Convert to Plasma code
                </motion.button>
              )}
              {state === 'converted' && (
                <motion.a
                  key="download"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  href={uri}
                  type="button"
                  download={`plasma_${file?.name}`}
                  className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-br from-red-500 to-purple-400 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:from-red-600 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save Plasma file
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                  </svg>
                </motion.a>
              )}
            </AnimatePresence>
          </div>
          {(state === 'uploaded' || state === 'converted') && <pre className="rounded border border-solid-2 border-slate-300 m-7 p-2 flex-grow resize-none justify-end overflow-y-auto max-h-[600px]">{text}</pre>}
        </div>
      </main>
    </>
  );
};

export default Home;
