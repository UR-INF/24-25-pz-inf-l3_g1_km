import { FC } from "react";

interface EmployeeCardProps {
  id: number;
  name: string;
  role?: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const EmployeeCard: FC<EmployeeCardProps> = ({
  id,
  name,
  role,
  avatarUrl,
  email,
  phoneNumber,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="col-md-6 col-lg-3">
      <div className="card overflow-hidden">
        <div className="card-body p-4 text-center">
          <span
            className="avatar avatar-xl mb-3 rounded"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          ></span>
          <h3 className="m-0 mb-1">{name}</h3>
          <div className="text-secondary">{role}</div>
        </div>

        <div className="d-flex">
          <a href={`mailto:${email}`} className="card-btn w-50">
            <i className="ti ti-mail fs-2 me-2"></i> Email
          </a>
          <a href={`tel:${phoneNumber}`} className="card-btn w-50">
            <i className="ti ti-phone fs-2 me-2"></i> Zadzwoń
          </a>
        </div>

        <div className="d-flex">
          <a className="card-btn w-50" onClick={() => onEdit && onEdit(id)}>
            <i className="ti ti-edit fs-2 me-2"></i> Edytuj
          </a>
          {!role?.includes("Menedżer") && (
            <a className="card-btn w-50" onClick={() => onDelete && onDelete(id)}>
              <i className="ti ti-trash fs-2 me-2"></i> Usuń
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
