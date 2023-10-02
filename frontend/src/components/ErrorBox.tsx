import './ErrorBox.css';

export function ErrorBox({ errorMessage }: { errorMessage: string | null }) {
  return (
    <div className="error-box">
      <p>Sorry, an error occured</p>
      <p>{errorMessage}</p>
    </div>
  );
}
