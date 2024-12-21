import { useRouteError } from "react-router-dom";

interface RouteError {
  data: string;
  error: Error;
  internal: boolean;
  status: string;
  statusText: string;
}

function ErrorPage() {
  const error = useRouteError() as RouteError;
  const errorCode = error.status ? `${error.status} - ` : '';
  const errorMessage = `${errorCode}${error.statusText}` || 'Unknown error';

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>{ errorMessage }</p>
    </div>
  );
}

export default ErrorPage;