import { TreeNode } from "./classexplorer"
import { FileProps } from "./page"
import { ChevronRight, ChevronDown } from "lucide-react"; // Import the icons

interface Props {
    curr: TreeNode,
    clicked: Record<string, boolean>,
    setClicked: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    file : FileProps,
    setFile : React.Dispatch<React.SetStateAction<FileProps>>,
}

export const TreePrint = ({ curr, clicked, setClicked, file, setFile }: Props) => {
    return <div>
        <div className="p-2">
            <button onClick={() => {
                if(curr.type==='file'){ 
                    setFile({
                        filecontent : curr.content || "",
                        filepath : curr.path || "",
                    })
                }

                setClicked((clicked) => ({
                    ...clicked,
                    [curr.id]: !(clicked[curr.id] || false)
                }));
            }}>
                {curr.type === 'folder' ? (
                    clicked[curr.id] ? '▼  📂' : '▶  📁'  // Open folder : Closed folder
                ) : (
                    '📄'  // File icon
                )}
                {curr.name}
                
            </button>
            {curr.type === 'folder' && clicked[curr.id] && curr.children.map((child: TreeNode) => (
                <TreePrint key={child.id} curr={child} clicked={clicked} setClicked={setClicked} file={file} setFile={setFile}/>
            ))}
        </div>
    </div>
}