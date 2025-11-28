export const sampleFileInput = {
  'documents/file1.txt': `{
  "pipelineId": "user-query-processing",
  "executionId": "exec_7x2b9k83n1p",
  "status": "completed",
  "duration": 12.2,
  "input": {
    "query": "Summarize the quarterly sales report and identify top performing products",
    "documents": ["q3-sales.pdf", "product-catalog.pdf"]
  },
  "output": {
    "summary": "Q3 2024 showed 15% revenue growth quarter-over-quarter...",
    "topProducts": [
      {"name": "Cloud Platform Enterprise", "revenue": "$1.2M", "growth": "22%"}
    ],
    "insights": ["Enterprise contracts are driving majority of growth"]
  },
  "metadata": {
    "model": "gpt-4",
    "tokenUsage": 14287,
    "cost": 0.43,
    "confidence": 0.94
  }
}`,
  'documents/file2.txt': 'Content of file 2',
  'documents/file3.txt': 'Content of file 3',
  'documents/src/a.jsx': 'Content of file a',
  'documents/src/b.jsx' : 'content of file b',
  'documents/ui/ux.ts' : 'content of file ux'
};

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children: TreeNode[];
  path: string;
  content: string | null;
}

interface FileInput {
  [filePath: string]: string; // filePath: fileContent
}

export class FileExplorer {
  private root: TreeNode;
  private nodeCounter: number = 0;

  constructor() {
    this.root = {
      id: this.generateId(),
      name: 'root',
      type: 'folder',
      children: [],
      path: '',
      content: null
    };
  }

  generateId(): string {
    return `node_${this.nodeCounter++}`;
  }

  private splitPath(filePath: string): string[] {
    return filePath.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  }

  processFileInput(fileInput: FileInput): void {
    this.root.children = [];
    
    Object.entries(fileInput).forEach(([filePath, content]) => {
      this.addPath(filePath, content);
    });
  }

  hasFileExtension(filename: string): boolean {
    // Check if the string contains a dot that's not at the start
    return /\.([a-zA-Z0-9]+)$/.test(filename);
  }

  addPath(filePath: string, content: string = ''): void {
    const pathParts = this.splitPath(filePath);
    
    if (pathParts.length === 0) return;

    let currentNode = this.root;
    let currentPath = '';

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      const isFile = this.hasFileExtension(part) && i === pathParts.length - 1;
      const existingChild = currentNode.children.find(child => child.name === part);

      if (existingChild) {
        currentNode = existingChild;
        if (isFile) {
          currentNode.content = content;
        }
      } else {
        const newNode: TreeNode = {
          id: this.generateId(),
          name: part,
          type: isFile ? 'file' : 'folder',
          children: [],
          path: currentPath,
          content: isFile ? content : null,
        };
        
        currentNode.children.push(newNode);
        
        if (!isFile) {
          currentNode = newNode;
        }
      }
    }
  }

  getTree(): TreeNode {
    return this.root.children[0];
  }
}

