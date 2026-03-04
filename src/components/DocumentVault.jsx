import { useState } from 'react';
import { Upload, FileText, Eye, Trash2, Link2, X, Check } from 'lucide-react';
import { DOCUMENT_SLOTS, updateStudent } from '../lib/firebase';
import ConfirmModal from './ConfirmModal';

export default function DocumentVault({ studentId, studentData = {}, documents = {}, onUpdate, activityLog = [], onActivityUpdate }) {
    const [saving, setSaving] = useState({});
    const [linkInputs, setLinkInputs] = useState({});
    const [linkValues, setLinkValues] = useState({});
    const [deleteSlot, setDeleteSlot] = useState(null); // Track which slot is pending deletion

    function openLinkInput(slot) {
        setLinkInputs(prev => ({ ...prev, [slot]: true }));
        setLinkValues(prev => ({ ...prev, [slot]: '' }));
    }

    function closeLinkInput(slot) {
        setLinkInputs(prev => ({ ...prev, [slot]: false }));
        setLinkValues(prev => ({ ...prev, [slot]: '' }));
    }

    async function handleSaveLink(slot) {
        const url = (linkValues[slot] || '').trim();
        if (!url) {
            alert('Please paste a link first.');
            return;
        }
        if (!url.startsWith('http')) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }

        const slotLabel = DOCUMENT_SLOTS.find(s => s.key === slot)?.label || slot;

        setSaving(prev => ({ ...prev, [slot]: true }));
        try {
            const docInfo = {
                url: url,
                name: 'Google Drive Link',
                type: 'link',
                isLink: true,
            };
            const updatedDocs = { ...documents, [slot]: docInfo };

            // Create activity log entry
            const logEntry = {
                action: 'document_added',
                label: slotLabel,
                url: url,
                timestamp: new Date().toISOString(),
            };
            const currentLog = activityLog || [];
            const updatedLog = [...currentLog, logEntry];

            await updateStudent(studentId, { documents: updatedDocs, activityLog: updatedLog });
            onUpdate(updatedDocs);
            if (onActivityUpdate) onActivityUpdate(updatedLog);
            closeLinkInput(slot);
        } catch (err) {
            console.error('Failed to save link:', err);
            alert('Failed to save link: ' + err.message);
        } finally {
            setSaving(prev => ({ ...prev, [slot]: false }));
        }
    }

    async function handleDeleteConfirmed() {
        if (!deleteSlot) return;
        const slotLabel = DOCUMENT_SLOTS.find(s => s.key === deleteSlot)?.label || deleteSlot;
        try {
            const updatedDocs = { ...documents };
            delete updatedDocs[deleteSlot];

            // Create activity log entry
            const logEntry = {
                action: 'document_removed',
                label: slotLabel,
                timestamp: new Date().toISOString(),
            };
            const currentLog = activityLog || [];
            const updatedLog = [...currentLog, logEntry];

            await updateStudent(studentId, { documents: updatedDocs, activityLog: updatedLog });
            onUpdate(updatedDocs);
            if (onActivityUpdate) onActivityUpdate(updatedLog);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Delete failed: ' + err.message);
        } finally {
            setDeleteSlot(null);
        }
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {DOCUMENT_SLOTS.map(({ key, label }) => {
                    const doc = documents[key];
                    const isLinkOpen = linkInputs[key];
                    const isSaving = saving[key];

                    return (
                        <div
                            key={key}
                            className="card p-3 flex flex-col gap-2 card-hover h-[140px] overflow-hidden"
                        >
                            <div className="flex items-center justify-between gap-1">
                                <h4 className="text-[11px] font-semibold text-neutral-700 leading-tight">{label}</h4>
                                <FileText size={14} className={`shrink-0 ${doc ? "text-primary-600" : "text-neutral-300"}`} />
                            </div>

                            {doc ? (
                                <div className="flex-1 flex flex-col justify-between min-h-0">
                                    <div>
                                        <p className="text-[10px] text-green-600 font-medium">✓ Linked</p>
                                        <p className="text-[9px] text-neutral-400 truncate" title={doc.url}>{doc.url}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary text-[10px] py-0.5 px-2 flex items-center justify-center gap-1 rounded"
                                        >
                                            <Eye size={10} />
                                            View
                                        </a>
                                        <button
                                            onClick={() => setDeleteSlot(key)}
                                            className="text-[10px] py-0.5 px-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                                            title="Remove"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                </div>
                            ) : isLinkOpen ? (
                                <div className="flex-1 flex flex-col justify-between gap-1 min-h-0">
                                    <input
                                        type="url"
                                        value={linkValues[key] || ''}
                                        onChange={(e) => setLinkValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder="Paste link here..."
                                        className="input-field text-[10px] py-1 px-2 w-full"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveLink(key);
                                            if (e.key === 'Escape') closeLinkInput(key);
                                        }}
                                    />
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleSaveLink(key)}
                                            disabled={isSaving}
                                            className="btn-primary text-[10px] py-0.5 px-2 flex-1 flex items-center justify-center gap-1 rounded"
                                        >
                                            <Check size={10} />
                                            {isSaving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => closeLinkInput(key)}
                                            className="text-[10px] py-0.5 px-1.5 rounded bg-neutral-100 text-neutral-500 hover:bg-neutral-200 flex items-center justify-center"
                                            title="Cancel"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <button
                                        onClick={() => openLinkInput(key)}
                                        className="w-full h-full border-2 border-dashed border-neutral-200 rounded-lg
                                        hover:border-primary-300 hover:bg-primary-50/30 transition-colors
                                        flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-primary-600"
                                    >
                                        <Link2 size={16} />
                                        <span className="text-[10px] font-medium">Add Link</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation Modal */}
            {
                deleteSlot && (
                    <ConfirmModal
                        isOpen={!!deleteSlot}
                        onClose={() => setDeleteSlot(null)}
                        onConfirm={handleDeleteConfirmed}
                        title="Remove Document Link"
                        message={`Are you sure you want to remove the link for "${DOCUMENT_SLOTS.find(s => s.key === deleteSlot)?.label}"? This action cannot be undone.`}
                        confirmText="Remove"
                        cancelText="Cancel"
                        type="danger"
                    />
                )
            }
        </>
    );
}
