import { useEffect, useRef } from "react";

const Footer = ({ onHeightChange }: { onHeightChange?: (height: number) => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !onHeightChange) return;

    const observer = new ResizeObserver(() => {
      const height = ref.current?.offsetHeight ?? 0;
      onHeightChange(height);
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <footer
      ref={ref}
      className="footer p-3 position-fixed bottom-0 start-0 w-100 border-top bg-body-surface z-3"
    >
      <div className="container-xl">
        <div className="row text-center align-items-center flex-row-reverse">
          <div className="col-lg-auto ms-lg-auto">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.ipcRenderer.send(
                      "open-external",
                      "https://github.com/UR-INF/24-25-pz-inf-l3_g1_km",
                    );
                  }}
                  className="link-secondary"
                  rel="noopener noreferrer"
                >
                  <i className="ti ti-brand-github text-primary fs-2 me-1" /> Repozytorium na
                  GitHubie
                </a>
              </li>
            </ul>
          </div>
          <div className="col-12 col-lg-auto mt-3 mt-lg-0">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                &copy; 2025 Hotel Task Manager. Wszelkie prawa zastrzeżone.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
