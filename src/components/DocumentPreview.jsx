/* eslint-disable react-hooks/set-state-in-effect */
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

export default function DocumentPreview({ document, onClose }) {
    // Destructure document properties - guard against null/undefined
    const url = document?.url ?? '';
    const name = document?.name ?? '';
    const type = document?.type ?? '';

    // Compute document type flags
    const isImage = type?.startsWith('image/');
    const isPdf = type === 'application/pdf';
    const isText = type === 'text/plain';
    const isWord = type?.includes('word') || name?.endsWith('.doc') || name?.endsWith('.docx');

    // Compute Word viewer URL using useMemo (no need for useEffect)
    const wordViewerUrl = useMemo(() => {
        if (!isWord || !url) return '';
        const encodedUrl = encodeURIComponent(url);
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
    }, [isWord, url]);

    // State for Word loading - starts true if Word doc
    const [wordLoading, setWordLoading] = useState(isWord);
    const [wordError, setWordError] = useState(false);

    // State for text content - lazy initialization to load on first render
    const [textState, setTextState] = useState(() => {
        // Only start loading if it's a text file and URL exists
        if (isText && url) {
            // Return a loading state indicator
            return { loading: true, content: '', error: false };
        }
        return { loading: false, content: '', error: false };
    });

    // Load text content for text files
    useEffect(() => {
        if (!isText || !url) return;

        // Set loading state
        setTextState(prev => ({ ...prev, loading: true, error: false }));

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load text content');
                return response.text();
            })
            .then(text => {
                setTextState({ loading: false, content: text, error: false });
            })
            .catch(err => {
                console.error('Error loading text:', err);
                setTextState({ loading: false, content: '', error: true });
            });
    }, [isText, url]);

    // Extract text state values
    const textLoading = textState.loading;
    const textContent = textState.content;
    const textError = textState.error;

    // Handle Word iframe load
    const handleWordLoad = () => {
        setWordLoading(false);
    };

    // Handle Word iframe error
    const handleWordError = () => {
        setWordLoading(false);
        setWordError(true);
    };

    // Return null if no document
    if (!document) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-800 truncate pr-4">
                        {name || 'Document Preview'}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={name}
                            className="btn-secondary text-xs py-1.5 px-3"
                        >
                            <Download size={14} />
                            Download
                        </a>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs py-1.5 px-3"
                        >
                            <ExternalLink size={14} />
                            Open
                        </a>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
                            aria-label="Close preview"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-1 min-h-[400px]">
                    {isPdf && (
                        <iframe
                            src={url}
                            title={name}
                            className="w-full h-full min-h-[500px] rounded-lg"
                            style={{ border: 'none' }}
                        />
                    )}

                    {isImage && (
                        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
                            <img
                                src={url}
                                alt={name}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    )}

                    {isText && (
                        <div className="w-full h-full min-h-[500px] rounded-lg bg-neutral-50 overflow-auto">
                            {textLoading && (
                                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-300 border-t-neutral-600"></div>
                                        <span className="text-sm">Loading text content...</span>
                                    </div>
                                </div>
                            )}
                            {textError && (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-500">
                                    <p className="text-sm">Failed to load text content.</p>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={name}
                                        className="btn-primary"
                                    >
                                        <Download size={16} />
                                        Download to View
                                    </a>
                                </div>
                            )}
                            {!textLoading && !textError && (
                                <pre className="w-full h-full p-4 text-sm text-neutral-700 font-mono whitespace-pre-wrap break-words">
                                    {textContent}
                                </pre>
                            )}
                        </div>
                    )}

                    {isWord && (
                        <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden bg-neutral-100">
                            {wordLoading && (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-600"></div>
                                    <p className="text-sm">Loading Word document...</p>
                                </div>
                            )}
                            {wordError && (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-500 p-4">
                                    <FileText size={48} className="text-neutral-300" />
                                    <p className="text-sm text-center">
                                        Unable to preview this Word document.
                                        <br />
                                        The document may need to be publicly accessible.
                                    </p>
                                    <div className="flex gap-2">
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={name}
                                            className="btn-primary"
                                        >
                                            <Download size={16} />
                                            Download
                                        </a>
                                        <a
                                            href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                        >
                                            <ExternalLink size={16} />
                                            Open in Office Online
                                        </a>
                                    </div>
                                </div>
                            )}
                            {!wordError && wordViewerUrl && (
                                <iframe
                                    src={wordViewerUrl}
                                    title={name}
                                    className="w-full h-full min-h-[500px]"
                                    style={{ border: 'none' }}
                                    onLoad={handleWordLoad}
                                    onError={handleWordError}
                                />
                            )}
                        </div>
                    )}

                    {!isPdf && !isImage && !isText && !isWord && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-500">
                            <p className="text-sm">Preview not available for this file type.</p>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={name}
                                className="btn-primary"
                            >
                                <Download size={16} />
                                Download
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
