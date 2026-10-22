export default function Icon({ name, className = '', fill = false }) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
            {name}
        </span>
    )
}