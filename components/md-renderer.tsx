import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="prose prose-slate max-w-full bg-gradient-to-br from-slate-50 to-slate-200 rounded-xl shadow-lg p-6 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 transition-all duration-300">
            <ReactMarkdown
                className="prose prose-slate max-w-full dark:prose-invert"
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                skipHtml={false}
                remarkPlugins={[remarkGfm]}
                components={{
                    code: (props) => {
                        const {inline, className, children, ...rest} = props as React.ComponentProps<'code'> & { inline?: boolean };
                        return !inline ? (
                            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-4">
                                <code className={className} {...rest}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            <code className="bg-slate-200 rounded px-1 py-0.5 text-pink-600" {...rest}>
                                {children}
                            </code>
                        );
                    },
                    blockquote({children, ...props}) {
                        return (
                            <blockquote className="border-l-4 border-blue-400 bg-blue-50 p-4 italic text-blue-900 rounded" {...props}>
                                {children}
                            </blockquote>
                        );
                    },
                    table({children, ...props}) {
                        return (
                            <div className="overflow-x-auto my-4">
                                <table className="min-w-full border-collapse" {...props}>
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    a({href, children, ...props}) {
                        return (
                            <a
                                href={href}
                                className="text-blue-600 underline hover:text-blue-800 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
