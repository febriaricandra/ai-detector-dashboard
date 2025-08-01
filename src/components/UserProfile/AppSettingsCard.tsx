import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Api from "../../utils/Api";
import { AxiosError } from "axios";

interface AppSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

export default function AppSettingsCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch app settings
  const getSettings = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/app-settings');
      if (response.status === 200) {
        console.log('App settings fetched:', response.data);
        setSettings(response.data);
        
        // Initialize form data
        const initialFormData: { [key: string]: string } = {};
        response.data.forEach((setting: AppSetting) => {
          initialFormData[setting.key] = setting.value;
        });
        setFormData(initialFormData);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Update each setting
      const updatePromises = Object.entries(formData).map(async ([key, value]) => {
        const setting = settings.find(s => s.key === key);
        if (setting) {
          const response = await Api.put(`/app-settings/${setting.key}`, { value });
          if (response.status !== 200) {
            throw new Error(`Failed to update ${key}`);
          }
        }
      });

      await Promise.all(updatePromises);
      
      // Refresh settings
      await getSettings();
      setSuccessMessage('Settings updated successfully');
      
      // Close modal after a short delay
      setTimeout(() => {
        closeModal();
        setSuccessMessage(null);
      }, 1500);
      
      console.log("Settings updated successfully");
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await Api.post('/analysis-results/cache/clear');
      
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Cache cleared successfully');
        console.log('Cache cleared successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        throw new Error('Failed to clear cache');
      }
    } catch (error: unknown) {
      console.error('Error clearing cache:', error);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || 'Failed to clear cache');
      } else {
        setError('Failed to clear cache');
      }

      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setClearingCache(false);
    }
  };

  const displaySettings = settings.slice(0, 4); // Show first 4 settings

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              App Settings
            </h4>

            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Loading settings...
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">
                Error: {error}
              </div>
            ) : successMessage ? (
              <div className="text-sm text-green-500 mb-4">
                {successMessage}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                {displaySettings.map((setting) => (
                  <div key={setting.id}>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                      {setting.value || 'Not set'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            {/* Clear Cache Button */}
            <button
              onClick={handleClearCache}
              disabled={clearingCache || loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 shadow-theme-xs hover:bg-orange-100 hover:text-orange-800 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300 lg:inline-flex lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clearingCache ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Clearing...
                </>
              ) : (
                <>
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7 13h10v-2H7v2z"
                      fill="currentColor"
                    />
                  </svg>
                  Clear Cache
                </>
              )}
            </button>

            {/* Edit Settings Button */}
            <button
              onClick={openModal}
              disabled={loading || clearingCache}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Edit Settings
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit App Settings
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your application environment variables and configuration settings.
            </p>
          </div>

          {error && (
            <div className="mx-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mx-2 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar max-h-96">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                {settings.map((setting) => (
                  <div key={setting.id}>
                    <Label>
                      {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {setting.description}
                      </p>
                    )}
                    <Input
                      type="text"
                      value={formData[setting.key] || ''}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      placeholder={`Enter ${setting.key.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                disabled={loading}
              >
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}