export default function StatusBadge({ status }) {
    const styles = {
        Draft: 'bg-neutral-100 text-neutral-600',
        Submitted: 'bg-primary-50 text-primary-700',
        Flagged: 'bg-red-100 text-red-700',
        'Document': 'bg-amber-100 text-amber-700',
        Admitted: 'bg-green-50 text-green-700',
        Rejected: 'bg-red-50 text-red-700',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.Draft
                }`}
        >
            {status || 'Draft'}
        </span>
    );
}
