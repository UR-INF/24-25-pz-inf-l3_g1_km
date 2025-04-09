const NotFoundView = () => {
  return (
    <div className="page page-center d-flex justify-content-center align-items-center min-vh-100">
      <div className="container-tight py-4">
        <div className="empty">
          <p className="empty-title">Ups… Widok nie został znaleziony 😿</p>
          <p className="empty-subtitle text-secondary">
            Przepraszamy, ale widok, którego szukasz, nie istnieje w naszej aplikacji. Spróbuj
            wrócić na stronę główną.
          </p>
          <div className="empty-action">
            <a href="/" className="btn btn-primary btn-4">
              <i className="ti ti-arrow-left fs-3 me-2"></i>
              Wróć do strony głównej
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
