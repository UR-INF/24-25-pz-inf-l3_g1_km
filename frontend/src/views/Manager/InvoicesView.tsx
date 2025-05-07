import InvoicesTable from "../../components/InvoicesTable";

const InvoicesView = () => {
  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <InvoicesTable />
        </div>
      </div>
    </div>
  );
};

export default InvoicesView;
