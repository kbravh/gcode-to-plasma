import type {NextPage} from 'next';
import Head from 'next/head';
import {clsx} from 'clsx';
import {useState} from 'react';
import {convertAndZip} from '../convertGCode';
import {AnimatePresence, motion} from 'framer-motion';

enum AppStates {
  initial = 'initial',
  uploading = 'uploading',
  uploaded = 'uploaded',
  converting = 'converting',
  converted = 'converted',
}
type AppState = keyof typeof AppStates;

export type FileWrapper = {
  file: File;
  uri: string;
};

const Home: NextPage = () => {
  const [state, setState] = useState<AppState>('initial');
  const [files, setFiles] = useState<FileWrapper[] | null>();
  const [uri, setUri] = useState<string>();

  const handleConvert = async () => {
    if (!files?.length) {
      return;
    }
    setState('converting');
    const uri = await convertAndZip(files);
    setUri(uri);
    setState('converted');
  };

  return (
    <>
      <Head>
        <title>G-Code to Plasma</title>
        <meta
          name="description"
          content="Convert G-Code to be plasma cutter compatible."
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <main className="min-h-screen max-h-screen flex flex-col items-center">
        <header className="container mx-auto flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
            G-Code to{' '}
            <span className="bg-gradient-to-br bg-clip-text from-red-500 to-purple-400 text-transparent">
              Plasma
            </span>
          </h1>
        </header>
        <div className="flex flex-col items-center">
          <div className="p-4 flex flex-col gap-4 justify-center items-center">
            {state === 'initial' && (
              <div className="flex flex-col items-center gap-1">
                <label htmlFor="file">Choose G-Code file(s):</label>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14m7-7-7 7-7-7" />
                </svg>

                <input
                  name="file"
                  type="file"
                  multiple={true}
                  accept=".nc"
                  onChange={e => {
                    if (!e.target.files?.length) {
                      return;
                    }
                    setState('uploading');
                    setFiles(
                      [...(e.target.files ?? [])].map(file => ({file, uri: ''}))
                    );
                    setState('uploaded');
                  }}
                  className={`ml-3 inline-flex items-center rounded border border-transparent ${
                    state === 'initial' ? 'bg-slate-600' : 'bg-slate-200'
                  } px-2.5 py-1.5 text-xs font-medium ${
                    state === 'initial' ? 'text-white' : 'text-slate-600'
                  } shadow-sm ${
                    state === 'initial' ? 'hover:bg-slate-800' : 'bg-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2`}
                />
              </div>
            )}
            {state === 'uploaded' && (
              <div className="flex gap-2">
                <motion.button
                  key="restart"
                  initial={{opacity: 0, y: 30}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, x: -30}}
                  onClick={() => setState('initial')}
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-slate-600/70 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M1 4v6h6m16 10v-6h-6" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                  Start over
                </motion.button>
                <motion.button
                  key="convert"
                  initial={{opacity: 0, y: 30}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, x: -30}}
                  onClick={handleConvert}
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-gradient-to-br from-red-500 to-purple-400 shadow-sm hover:from-red-600 hover:to-purple-500 px-3 py-2 text-sm font-medium leading-4 text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Convert to Plasma code
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 ml-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                    />
                  </svg>
                </motion.button>
              </div>
            )}
            <AnimatePresence mode="wait">
              {(state === 'uploaded' || state === 'converting') && (
                <motion.div
                  key="uploaded-actions"
                  initial={{opacity: 0, y: 30}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, x: -30}}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-3xl mb-3">Files</h3>
                  <ul className="flex flex-col gap-2">
                    {files?.map((file, i) => (
                      <motion.div
                        key={`file-${i}`}
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, x: -30}}
                        className={clsx(
                          'inline-flex items-center rounded-sm px-3 py-2 text-sm font-medium leading-4 text-slate-800',
                          'border border-transparent bg-slate-200',
                          'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 mr-1"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6m-4 5H8m8 4H8m2-8H8" />
                        </svg>

                        {file.file.name}
                      </motion.div>
                    ))}
                  </ul>
                </motion.div>
              )}
              {state === 'converted' && (
                <>
                  <motion.div
                    key="download-actions"
                    className="flex gap-2"
                  >
                    <motion.button
                      key="restart"
                      initial={{opacity: 0, y: 30}}
                      animate={{opacity: 1, y: 0}}
                      onClick={() => setState('initial')}
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-slate-600/70 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 mr-2"
                      >
                        <path d="M1 4v6h6m16 10v-6h-6" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      Start over
                    </motion.button>
                  </motion.div>
                  <motion.div className="flex flex-col items-center">
                    <h3 className="text-3xl mb-3">Download all files</h3>
                    <motion.div className='mb-4'
                      initial={{opacity: 0, y: 30}}
                      animate={{opacity: 1, y: 0}}
                    >
                      <motion.a
                        initial={{opacity: 0, y: 30}}
                        animate={{opacity: 1, y: 0}}
                        href={uri}
                        type="button"
                        download={`plasma_files_${new Date().getTime()}.zip`}
                        className={clsx(
                          'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium leading-4 text-white',
                          'border border-transparent bg-gradient-to-br from-red-500 to-purple-400 shadow-sm hover:from-red-600 hover:to-purple-500',
                          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        )}
                      >
                        Save as ZIP
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 ml-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 13.5l3 3m0 0l3-3m-3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                          />
                        </svg>
                      </motion.a>
                    </motion.div>
                    <h3 className="text-3xl mb-3">Download individual files</h3>
                    <ul className="flex flex-col gap-2">
                      {files?.map((file, i) => (
                        <motion.a
                          key={`file-${i}`}
                          initial={{opacity: 0, y: 30}}
                          animate={{opacity: 1, y: 0}}
                          href={file.uri}
                          download={`plasma_${file.file.name}`}
                          className={clsx(
                            'inline-flex items-center rounded-sm px-3 py-2 text-sm font-medium leading-4 text-slate-800',
                            'border border-transparent bg-slate-200',
                            'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
                          )}
                        >
                          {file.file.name}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="w-4 h-4 ml-1"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" />
                          </svg>
                        </motion.a>
                      ))}
                    </ul>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
