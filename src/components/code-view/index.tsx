import { useEffect } from "react"
import "./code-theme.css"

interface Props{
    code : string
    lang : string
}

export const Codeview  = ({code , lang} : Props)=>{
    useEffect(() => {
        // Only run on client side
        if (typeof window !== "undefined") {
            // Dynamically import Prism only on client
            import("prismjs").then((Prism) => {
                // Use require instead of import for components to avoid TS complaints
                require("prismjs/components/prism-javascript")
                require("prismjs/components/prism-jsx")
                require("prismjs/components/prism-tsx")
                require("prismjs/components/prism-typescript")
                
                Prism.highlightAll()
            }).catch((error) => {
                console.error("Error loading Prism:", error)
            })
        }
    }, [code, lang])

    return (
        <pre
           className="p-2 bg-transparent border-none rounded-none m-0 text-xs"
        >
            <code className={`language-${lang}`}>
                {code}
            </code>
        </pre>
    )
}