import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function TextGenerated() {
  return (
    <>
      <PageMeta
        title="React.js Text Generated Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Text Generated Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Text Generated" />
      <div className="space-y-6">
        <ComponentCard title="List Text">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
