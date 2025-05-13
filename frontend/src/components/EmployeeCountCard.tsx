import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";
import { getRoleNameInPolish } from "../utils/roleUtils";
import { RoleName } from "../contexts/user";

const EmployeeCountCard = () => {
  const [employees, setEmployees] = useState([]);
  const [roleCounts, setRoleCounts] = useState<Record<RoleName, number>>({
    MANAGER: 0,
    RECEPTIONIST: 0,
    HOUSEKEEPER: 0,
    MAINTENANCE: 0,
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await api.get("/employees");
        const data = response.data;
        setEmployees(data);

        const counts = {
          MANAGER: 0,
          RECEPTIONIST: 0,
          HOUSEKEEPER: 0,
          MAINTENANCE: 0,
        };

        for (const emp of data) {
          const role = emp.role?.name;
          if (role && counts.hasOwnProperty(role)) {
            counts[role]++;
          }
        }

        setRoleCounts(counts);
      } catch (error) {
        console.error("Błąd podczas pobierania pracowników:", error);
        setEmployees([]);
      }
    };

    loadEmployees();
  }, []);

  const total = employees.length;

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between mb-2">
            <div>
              <div className="subheader">Pracowników</div>
              <div className="h1">{total}</div>
            </div>

            <ul className="list-unstyled small">
              <li className="mb-1">
                <span className="badge bg-primary text-white me-1">Menedżer</span>
                {roleCounts.MANAGER}
              </li>
              <li className="mb-1">
                <span className="badge bg-success text-white me-1">Recepcjonista</span>
                {roleCounts.RECEPTIONIST}
              </li>
              <li className="mb-1">
                <span className="badge bg-warning text-white me-1">Pokojówka</span>
                {roleCounts.HOUSEKEEPER}
              </li>
              <li>
                <span className="badge bg-danger text-white me-1">Konserwator</span>
                {roleCounts.MAINTENANCE}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCountCard;
