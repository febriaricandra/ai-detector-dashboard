import { useState } from 'react';
import { Link } from 'react-router';
import { Play, ChevronDown, Upload, Shield, FileText, BarChart3, Users } from 'lucide-react';
import { useAuth } from './context/AuthContext';

type AnalysisResult = {
    aiPercentage: number;
    humanPercentage: number;
    reason: string;
};

const AIDetectorLanding = () => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; content: string; } | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate analysis
        setTimeout(() => {
            setAnalysisResult({
                aiPercentage: 22,
                humanPercentage: 78,
                reason: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    const handleSampleText = () => {
        setSelectedFile({ name: "sample.txt", type: "text/plain", content: "This is a sample text for AI detection." });
    };

    const scrollToDetector = () => {
        document.getElementById('detector')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">AI Detector</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#detector" className="text-gray-700 hover:text-blue-600 font-medium">AI Detector</a>
                            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                                    >
                                        <span>{user.username}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                            <Link
                                                to="/dashboard"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/signin"
                                        className="text-gray-700 hover:text-blue-600 font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        AI Detector for{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            professional writing
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Ensure every report, proposal, or message is original, authentic, and AI-free.
                    </p>
                    <button
                        onClick={scrollToDetector}
                        className="animate-bounce bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
                    >
                        <ChevronDown className="w-6 h-6" />
                    </button>
                </div>
            </section>

            {/* AI Detector Section */}
            <section id="detector" className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Detector Input */}
                        <div className="bg-white rounded-xl h-full shadow-lg p-8 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Detector</h2>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                                <textarea
                                    placeholder="Paste your text here to detect AI content..."
                                    className="w-full h-40 p-4 border-0 resize-none focus:outline-none text-gray-700 placeholder-gray-400"
                                    onChange={(e) => {
                                        if (e.target.value.trim()) {
                                            setSelectedFile({
                                                name: "text-input",
                                                type: "text/plain",
                                                content: e.target.value
                                            });
                                        } else {
                                            setSelectedFile(null);
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedFile || isAnalyzing}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    {isAnalyzing ? 'Analyzing...' : 'Detect AI Content'}
                                </button>

                                <button
                                    onClick={handleSampleText}
                                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Sample Text
                                </button>
                                <button
                                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload File
                                </button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Result</h2>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>

                            {analysisResult ? (
                                <div>
                                    <p className="text-blue-600 font-medium mb-6">Show Percentage of Text Analysis</p>

                                    <div className="flex mb-6">
                                        {/* Donut Chart */}
                                        <div className=" w-44 h-44 mx-auto relative">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="35"
                                                    fill="none"
                                                    stroke="#e5e7eb"
                                                    strokeWidth="8"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="35"
                                                    fill="none"
                                                    stroke="#3b82f6"
                                                    strokeWidth="8"
                                                    strokeDasharray={`${analysisResult.humanPercentage * 2.2} 220`}
                                                    strokeLinecap="round"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="35"
                                                    fill="none"
                                                    stroke="#06b6d4"
                                                    strokeWidth="8"
                                                    strokeDasharray={`${analysisResult.aiPercentage * 2.2} 220`}
                                                    strokeDashoffset={`${-analysisResult.humanPercentage * 2.2}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>

                                        {/* Percentages */}
                                        <div className="flex flex-row">
                                            <div className="flex mb-4">
                                                <div className="bg-blue-100 rounded-lg p-4 flex flex-col items-center mr-4">
                                                    <p className="text-xl text-blue-700 my-auto font-semibold">
                                                        {analysisResult.aiPercentage}%
                                                    </p>
                                                    <h2 className="text-lg font-bold text-blue-900">AI Generated</h2>
                                                </div>
                                                <div className="bg-green-100 rounded-lg p-4 flex flex-col items-center">
                                                    <p className="text-xl text-green-700 my-auto font-semibold">
                                                        {analysisResult.humanPercentage}%
                                                    </p>
                                                    <h2 className="text-lg font-bold text-green-900">Human Written</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Reason:</span> {analysisResult.reason}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Upload a file and click analyze to see results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Investment Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        We invest in the world's potential
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Here at flowbite we focus on markets where technology, innovation, and capital
                        can unlock long-term value and drive economic growth.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                            Login
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-colors">
                            Learn more
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Our AI Detector?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Advanced technology to ensure content authenticity
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Accurate Detection</h3>
                            <p className="text-gray-600">
                                Our advanced AI algorithms provide highly accurate detection of AI-generated content
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Multiple Formats</h3>
                            <p className="text-gray-600">
                                Support for various file formats including text, PDF, and document files
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Use</h3>
                            <p className="text-gray-600">
                                Designed for educators, businesses, and content creators who need reliable detection
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xl font-bold">AI Detector</span>
                            </div>
                            <p className="text-gray-400 max-w-md">
                                Professional AI detection tool for ensuring content authenticity and originality in your work.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI Detector</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Access</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2025 AI Detector. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AIDetectorLanding;