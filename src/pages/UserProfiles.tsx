import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import AppSettingsCard from "../components/UserProfile/AppSettingsCard";

export default function UserProfiles() {
  return (
    <>
      <PageMeta
        title="AI Detector Dashboard | Profile"
        description="This is the Profile page for the AI Detector Dashboard"
      />
      {/* Custom favicon to match navigation logo */}
      <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3e%3ccircle cx='20' cy='20' r='20' fill='%232563eb'/%3e%3cpath d='M15 13l10 7-10 7V13z' fill='white'/%3e%3c/svg%3e" />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <AppSettingsCard />
        </div>
      </div>
    </>
  );
}
