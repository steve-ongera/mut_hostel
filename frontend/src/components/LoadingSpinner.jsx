// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ size = "md", color = "maroon", text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const colorClasses = {
    maroon: "border-maroon",
    white: "border-white",
    gold: "border-gold",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-4 border-t-transparent rounded-full animate-spin ${colorClasses[color]}`}
        style={{ borderTopColor: "transparent" }}
      />
      {text && <span className="text-muted text-sm">{text}</span>}
    </div>
  );
}