export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__circle" aria-hidden="true" />
      <p className="loading-spinner__text">{message}</p>
    </div>
  );
}
