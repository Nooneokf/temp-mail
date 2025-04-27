// components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {

    return (
        <div className="prose prose-slate max-w-full">
            <ReactMarkdown
                className={"prose prose-slate max-w-full"}
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                skipHtml={false} // Ensures HTML tags are rendered
                remarkPlugins={[remarkGfm]}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
