import { TreeItem } from "@/types";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarProvider,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "lucide-react";

interface TreeViewProps{
    data : TreeItem[];
    value?: string | null;
    onSelect?: (value : string)=> void
};

export const TreeView=({
    data,
    value,
    onSelect
} : TreeViewProps)=>{
    return (
        <SidebarProvider>
            <Sidebar collapsible="none" className="w-full">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {data.map((item, index)=>(
                                    <Tree
                                    key = {index}
                                    item={item}
                                    selectedValue={value}
                                    onSelect={onSelect}
                                    parentPath=""
                                    />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail/>
            </Sidebar>
        </SidebarProvider>
    )
}

interface TreeProps{
    item : TreeItem;
    selectedValue?: string | null
    onSelect? : (value :  string) => void;
    parentPath : string; 
}

const Tree = ({item, selectedValue, onSelect, parentPath} : TreeProps)=>{
    // Better type handling
    const isFolder = Array.isArray(item);
    
    if (!isFolder) {
        // It's a file (string)
        const fileName = item;
        const currentPath = parentPath ? `${parentPath}/${fileName}` : fileName;
        const isSelected = selectedValue === currentPath;

        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                   isActive={isSelected}
                   className="data-[active=true]:bg-transparent"
                   onClick={()=> onSelect?.(currentPath)}
                >
                    <FileIcon className="h-4 w-4"/>
                    <span className="truncate">{fileName}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    // It's a folder (array)
    const [folderName, ...children] = item;
    const currentPath = parentPath ? `${parentPath}/${folderName}` : folderName;

    return (
        <SidebarMenuItem>
            <Collapsible className="group/collapsible" defaultOpen>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <div className="flex items-center gap-1">
                            <ChevronRightIcon className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                            <FolderIcon className="h-4 w-4"/>
                            <span className="truncate">{folderName}</span>
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {children.map((subItem, index)=>(
                            <Tree 
                            key={index}
                            item={subItem}
                            selectedValue={selectedValue}
                            onSelect={onSelect}
                            parentPath={currentPath}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
}