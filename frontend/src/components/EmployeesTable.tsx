import { useEffect, useState } from "react";
import EmployeeCard from "./EmployeeCard";
import { api } from "../services/api";
import { RoleName } from "../contexts/user";
import { getRoleNameInPolish } from "../utils/roleUtils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useNotification } from "../contexts/notification";
import { useNavigate } from "react-router";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: {
    name: RoleName;
  };
  avatarUrl: string;
}

interface EmployeesTableProps {
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  onDataUpdate: (data: { totalItems: number; startIndex: number; endIndex: number }) => void;
}

const EmployeesTable = ({
  searchQuery,
  currentPage,
  pageSize,
  onDataUpdate,
}: EmployeesTableProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await api.get("/employees");
        const employeesData = response.data as Employee[];
        setEmployees(employeesData);
      } catch (error) {
        console.error("Błąd podczas pobierania pracowników:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleDeleteClick = (id, role) => {
    if (role === RoleName.MANAGER) {
      showNotification("error", "Nie możesz usunąć menadżera hotelu.");
    } else {
      setSelectedUserId(id);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/employees/${selectedUserId}`);
      setEmployees((prev) => prev.filter((user) => user.id !== selectedUserId));
      showNotification("success", "Pracownik został usunięty.");
    } catch (err) {
      console.error("Błąd podczas usuwania pracownika:", err);
      showNotification("error", "Nie udało się usunąć pracownika.");
    } finally {
      setShowDeleteModal(false);
      setSelectedUserId(null);
    }
  };

  // Filtrowanie po wyszukiwarce
  const filteredEmployees = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Paginacja
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  // Aktualizujemy dane paginacji przy każdej zmianie
  useEffect(() => {
    if (!loading) {
      onDataUpdate({
        totalItems: filteredEmployees.length,
        startIndex: filteredEmployees.length === 0 ? 0 : startIndex + 1,
        endIndex: Math.min(startIndex + pageSize, filteredEmployees.length),
      });
    }
  }, [loading, filteredEmployees.length, startIndex, pageSize, onDataUpdate]);

  if (loading) {
    return <div>Ładowanie pracowników...</div>;
  }

  return (
    <div className="row row-cards">
      {paginatedEmployees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          id={employee.id}
          name={`${employee.firstName} ${employee.lastName}`}
          role={getRoleNameInPolish(employee.role.name)}
          avatarUrl={employee.avatarUrl}
          email={employee.email}
          phoneNumber={employee.phoneNumber}
          onEdit={(id) => navigate(`/ManagerDashboard/Employees/Modify/${id}`)}
          onDelete={(id) => handleDeleteClick(id, employee.role.name)}
        />
      ))}

      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleConfirm={handleConfirmDelete}
        message="Czy na pewno chcesz usunąć tego pracownika? Nie można cofnąć tej operacji."
      />
    </div>
  );
};

export default EmployeesTable;