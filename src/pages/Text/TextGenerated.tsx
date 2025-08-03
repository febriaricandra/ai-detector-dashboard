import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function TextGenerated() {
  return (
    <>
      <PageMeta
        title="AI Detector Dashboard | Text Generated"
        description="This is AI Detector Dashboard page for Text Generated"
      />
      {/* Custom favicon to match navigation logo */}
      <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3e%3ccircle cx='20' cy='20' r='20' fill='%232563eb'/%3e%3cpath d='M15 13l10 7-10 7V13z' fill='white'/%3e%3c/svg%3e" />
      <PageBreadcrumb pageTitle="Text Generated" />
      <div className="space-y-6">
        <ComponentCard title="List Text">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
