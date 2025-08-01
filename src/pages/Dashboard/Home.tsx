import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { FileIcon, BoxIcon, BarChart3, Shield, Users } from "lucide-react";

interface NavigationCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const navigationCards: NavigationCard[] = [
  {
    title: "Text Analysis",
    description: "View and manage analyzed text results from AI detection",
    path: "/text-generated",
    icon: <FileIcon className="w-8 h-8" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100"
  },
  {
    title: "Usage Charts",
    description: "View detailed analytics and usage statistics",
    path: "/dashboard",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "text-green-600", 
    bgColor: "bg-green-50 hover:bg-green-100"
  },
  {
    title: "Profile Settings",
    description: "Manage your profile and application settings",
    path: "/profile",
    icon: <BoxIcon className="w-8 h-8" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100"
  },
  {
    title: "AI Detector Tool",
    description: "Go to main AI detection landing page",
    path: "/",
    icon: <Shield className="w-8 h-8" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50 hover:bg-orange-100"
  }
];

export default function Home() {
  return (
    <>
      <PageMeta
        title="AI Detector Dashboard | Home"
        description="Main dashboard for AI text detection and analysis tools"
      />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to AI Detector Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your AI text detection results and explore analytics insights
        </p>
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {navigationCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className={`block p-6 rounded-xl border border-gray-200 dark:border-gray-700 ${card.bgColor} dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-105 group`}
          >
            <div className={`${card.color} dark:text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <FileIcon className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Detected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
            </div>
            <div className="text-red-600 dark:text-red-400">
              <Shield className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Human Written</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
            </div>
            <div className="text-green-600 dark:text-green-400">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
