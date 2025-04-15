import { useNavigate } from "react-router";

const NotFoundView = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="page page-center d-flex justify-content-center align-items-center min-vh-100">
      <div className="container-tight py-4">
        <div className="empty">
          <p className="empty-title">Ups… Widok nie został znaleziony 😿</p>
          <p className="empty-subtitle text-secondary">
            Przepraszamy, ale widok, którego szukasz, nie istnieje w naszej aplikacji.
          </p>
          <div className="empty-action">
            <button className="btn btn-primary btn-4" onClick={handleGoBack}>
              <i className="ti ti-arrow-left fs-3 me-2"></i>
              Wróć do poprzedniej strony
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
