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
      <PageBreadcrumb pageTitle="Text Generated" />
      <div className="space-y-6">
        <ComponentCard title="List Text">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </>
  );
}
