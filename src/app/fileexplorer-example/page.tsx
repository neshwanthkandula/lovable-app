"use client"
import { FileExplorer } from './classexplorer'
import { TreePrint } from './TreePrint'
import { sampleFileInput } from './sampleInput';
import { Copy, CopyCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Add these imports for languages
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';

export interface FileProps{
  filecontent : string,
  filepath : string
}

const Page = () => {
  const Tree = new FileExplorer();
  Tree.processFileInput(sampleFileInput);
  let root = Tree.getTree();
  
  const [clicked, setClicked] = useState<Record<string, boolean>>({});
  const [file , setFile] = useState<FileProps>({filecontent : "", filepath : ""});
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      Prism.highlightAll();
    }, 0);
  }, [file.filecontent]);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.filecontent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch(err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-screen">
      
      {/* File Explorer Panel */}
      <ResizablePanel defaultSize={15} className="min-h-screen overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="font-bold p-4 border-b">File Structure</div>
          <div className="flex-1 overflow-auto">
            <TreePrint 
              curr={root} 
              clicked={clicked} 
              setClicked={setClicked} 
              file={file} 
              setFile={setFile}
            />
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Content Panel */}
      <ResizablePanel defaultSize={70} className="min-h-screen overflow-hidden">
        <div className="h-full p-6 overflow-auto">
          <div className='flex justify-between items-center mb-4'>
            <h2 className="text-lg font-bold">
              {file.filepath}
            </h2>
            {file.filecontent && (
              isCopied ? (
                <CopyCheck className='cursor-pointer' size={18} />
              ) : (
                <Copy className='cursor-pointer' size={18} onClick={handleCopy} />
              )
            )}
          </div>
          
          {file.filecontent ? (
            <div className="bg-gray-900 rounded border">
              <pre className="whitespace-pre-wrap p-4 m-0">
                <code className="language-typescript">
                  {file.filecontent}
                </code>
              </pre>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Click on a file to view its content
            </div>
          )}
        </div>
      </ResizablePanel>

    </ResizablePanelGroup>
  )
}

export default Page
