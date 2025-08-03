import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Play, ChevronDown, Upload, Shield, FileText, BarChart3, Users } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Api from '../utils/Api';
import PageMeta from '../components/common/PageMeta';

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
    message?: string;
}

type AnalysisResult = {
    aiPercentage: number;
    humanPercentage: number;
    reason: string;
    prediction: string;
    confidence: {
        ai: number;
        human: number;
    };
};

const AIDetectorLanding = () => {
    const { user, logout } = useAuth();
    const [textInput, setTextInput] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string>('');
    const [uploadedFileName, setUploadedFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);




    const handleAnalyze = async () => {
        if (!textInput.trim() || !user) {
            setError('Please login and provide text to analyze');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            const response = await Api.post('/analysis-results', {
                data: textInput.trim()
            });

            // Transform response data to match our AnalysisResult interface
            // Updated to use the correct property names: ai and human instead of ai_probability and human_probability
            const aiPercentage = Math.round((response.data.flask_confidence?.ai || 0) * 100);
            const humanPercentage = Math.round((response.data.flask_confidence?.human || 0) * 100);

            // Extract reason from gemini_analysis if available
            let reason = "Analysis completed successfully";
            if (response.data.gemini_analysis?.analysis) {
                try {
                    // Try to parse the Gemini analysis to get conclusion
                    const analysisText = response.data.gemini_analysis.analysis;
                    const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch) {
                        const parsedAnalysis = JSON.parse(jsonMatch[1]);
                        reason = parsedAnalysis.conclusion?.confidence_explanation || reason;
                    }
                } catch (parseError) {
                    console.warn('Could not parse Gemini analysis:', parseError);
                }
            }

            setAnalysisResult({
                aiPercentage,
                humanPercentage,
                reason,
                prediction: response.data.flask_prediction,
                confidence: response.data.flask_confidence
            });

        } catch (err: unknown) {
            const apiError = err as ApiError;
            console.error('Analysis error:', err);

            if (apiError.response?.status === 401) {
                setError('Please login to use the AI detector');
            } else if (apiError.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (apiError.response?.data?.message) {
                setError(apiError.response.data.message);
            } else if (apiError.message) {
                setError(apiError.message);
            } else {
                setError('Analysis failed. Please try again.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleFileUpload called:', event.target.files);

        const file = event.target.files?.[0];
        console.log('Selected file:', file);

        if (!file) {
            console.log('No file selected');
            setError('No file uploaded. Please select a file.');
            return;
        }

        if (!user) {
            console.log('User not logged in');
            setError('Please login to upload files');
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file only');
            return;
        }

        // Reduce file size limit to 2MB to avoid server limits
        const maxSize = 2 * 1024 * 1024; // 2MB instead of 5MB
        if (file.size > maxSize) {
            setError('File size must be less than 2MB');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setUploadedFileName(file.name);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

            // Create custom config for FormData upload - remove Content-Type header
            const config = {
                timeout: 60000, // 60 seconds timeout
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    // Don't set Content-Type - let browser set it with boundary for FormData
                }
            };

            const response = await Api.post('/analysis-results/analyze-text-pdf', formData, config);

            console.log('Upload response:', response.data);

            // Transform response data to match our AnalysisResult interface
            // Updated to use the correct property names: ai and human instead of ai_probability and human_probability
            const aiPercentage = Math.round((response.data.flask_confidence?.ai || 0) * 100);
            const humanPercentage = Math.round((response.data.flask_confidence?.human || 0) * 100);

            // Extract reason from gemini_analysis if available
            let reason = "PDF analysis completed successfully";
            if (response.data.gemini_analysis?.analysis) {
                try {
                    // Try to parse the Gemini analysis to get conclusion
                    const analysisText = response.data.gemini_analysis.analysis;
                    const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch) {
                        const parsedAnalysis = JSON.parse(jsonMatch[1]);
                        reason = parsedAnalysis.conclusion?.confidence_explanation || reason;
                    }
                } catch (parseError) {
                    console.warn('Could not parse Gemini analysis:', parseError);
                }
            }

            // Set the extracted text to display in textarea
            if (response.data.text) {
                setTextInput(response.data.text);
            }

            setAnalysisResult({
                aiPercentage,
                humanPercentage,
                reason,
                prediction: response.data.flask_prediction,
                confidence: response.data.flask_confidence
            });

        } catch (err: unknown) {
            const apiError = err as ApiError;
            console.error('PDF Analysis error:', err);

            if (apiError.response?.status === 401) {
                setError('Please login to upload and analyze files');
            } else if (apiError.response?.status === 413) {
                setError('File too large. Please upload a file smaller than 2MB');
            } else if (apiError.response?.status === 400) {
                const errorMessage = apiError.response.data?.message;
                if (errorMessage && errorMessage.includes('No file uploaded')) {
                    setError('No file was received by server. Please try selecting the file again.');
                } else {
                    setError(errorMessage || 'Invalid file. Please check if the file is a valid PDF');
                }
            } else if (apiError.response?.status === 500) {
                setError('Server error during PDF analysis. Please try again later.');
            } else if (apiError.response?.data?.message) {
                setError(apiError.response.data.message);
            } else if (apiError.message?.includes('timeout')) {
                setError('Upload timeout. Please try with a smaller file.');
            } else if (apiError.message?.includes('Network Error')) {
                setError('Network error. Please check your connection and try again.');
            } else if (apiError.message) {
                setError(apiError.message);
            } else {
                setError('PDF analysis failed. Please try again.');
            }
        } finally {
            setIsAnalyzing(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUploadClick = () => {
        if (!user) {
            setError('Please login to upload files');
            return;
        }

        // Clear previous errors and results
        setError('');
        setAnalysisResult(null);

        // Debug: Check if file input ref exists
        console.log('File input ref:', fileInputRef.current);

        fileInputRef.current?.click();
    };

    const handleSampleText = () => {
        const sampleText = "Artificial intelligence (AI) is revolutionizing various industries by automating processes, enhancing decision-making, and improving efficiency. Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions. Natural language processing enables computers to understand and generate human-like text. Deep learning networks, inspired by the human brain, can perform complex tasks such as image recognition and language translation.";
        setTextInput(sampleText);
        setUploadedFileName(''); // Clear uploaded file name when using sample text
    };

    const scrollToDetector = () => {
        document.getElementById('detector')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <PageMeta 
                title="AI Detector - Professional AI Content Detection Tool" 
                description="Detect AI-generated content with our advanced AI detector. Ensure originality and authenticity in your professional writing, reports, and documents. Upload PDF files or paste text for instant analysis."
            />
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
                                                to="/text-generated"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Text Analysis
                                            </Link>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    logout();
                                                }}
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

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {/* Login Notice for Non-authenticated Users */}
                            {!user && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
                                    <p className="text-sm">
                                        Please{' '}
                                        <Link to="/signin" className="font-medium underline hover:text-yellow-800">
                                            login
                                        </Link>
                                        {' '}to use the AI detector feature.
                                    </p>
                                </div>
                            )}

                            {/* Uploaded File Name */}
                            {uploadedFileName && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6">
                                    <p className="text-sm">
                                        <strong>Uploaded file:</strong> {uploadedFileName}
                                    </p>
                                </div>
                            )}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                                <textarea
                                    placeholder="Paste your text here to detect AI content, or upload a PDF file..."
                                    className="w-full h-40 p-4 border-0 resize-none focus:outline-none text-gray-700 placeholder-gray-400"
                                    value={textInput}
                                    onChange={(e) => {
                                        setTextInput(e.target.value);
                                        // Clear previous results and errors when text changes
                                        setAnalysisResult(null);
                                        setError('');
                                        setUploadedFileName(''); // Clear uploaded file name when typing
                                    }}
                                />
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                    console.log('File input change event:', e.target.files);
                                    handleFileUpload(e);
                                }}
                                className="hidden"
                                key={uploadedFileName ? 'file-uploaded' : 'no-file'}
                            />

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!textInput.trim() || isAnalyzing || !user}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    {isAnalyzing ? 'Analyzing...' : 'Detect AI Content'}
                                </button>

                                <button
                                    onClick={handleSampleText}
                                    disabled={isAnalyzing}
                                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Sample Text
                                </button>

                                <button
                                    onClick={handleUploadClick}
                                    disabled={isAnalyzing || !user}
                                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {isAnalyzing ? 'Processing...' : 'Upload PDF'}
                                </button>
                            </div>

                            {/* Word Count and File Info */}
                            <div className="mt-4 text-sm text-gray-500 flex justify-between">
                                {textInput.trim() && (
                                    <span>Word count: {textInput.trim().split(/\s+/).length}</span>
                                )}
                                <span className="text-xs text-gray-400">
                                    Supported: PDF files (max 10MB)
                                </span>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Result</h2>
                                {/* <button className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button> */}
                            </div>

                            {isAnalyzing ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-500">
                                        {uploadedFileName ? 'Processing PDF and analyzing text...' : 'Analyzing text...'}
                                    </p>
                                </div>
                            ) : analysisResult ? (
                                <div>
                                    <p className="text-blue-600 font-medium mb-6">Show Percentage of Text Analysis</p>

                                    <div className="flex mb-6">
                                        {/* Donut Chart */}
                                        <div className="w-54 h-54 mx-auto relative">
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
                                                    stroke="#10b981"
                                                    strokeWidth="8"
                                                    strokeDasharray={`${analysisResult.humanPercentage * 2.2} 220`}
                                                    strokeLinecap="round"
                                                />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="35"
                                                    fill="none"
                                                    stroke="#ef4444"
                                                    strokeWidth="8"
                                                    strokeDasharray={`${analysisResult.aiPercentage * 2.2} 220`}
                                                    strokeDashoffset={`${-analysisResult.humanPercentage * 2.2}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>

                                            {/* Center percentage display */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {analysisResult.prediction === 'AI' ? analysisResult.aiPercentage : analysisResult.humanPercentage}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {analysisResult.prediction}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Percentages */}
                                        <div className="flex flex-row">
                                            <div className="flex mb-4">
                                                <div className="bg-red-100 rounded-lg p-4 flex flex-col items-center mr-4">
                                                    <p className="text-xl text-red-700 my-auto font-semibold">
                                                        {analysisResult.aiPercentage}%
                                                    </p>
                                                    <h2 className="text-lg font-bold text-red-900">AI Generated</h2>
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

                                    {/* Legend with colored dots */}
                                    <div className="flex justify-center gap-6 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">AI Generated</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Human Written</span>
                                        </div>
                                    </div>

                                    {/* Prediction Badge */}
                                    <div className="flex justify-center mb-4">
                                        <div className={`px-4 py-2 rounded-full font-medium ${analysisResult.prediction === 'AI'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            Prediction: {analysisResult.prediction}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Analysis Summary:</span> {analysisResult.reason}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {user ? "Enter text, upload PDF, or click analyze to see results" : "Login to start analyzing text"}
                                    </p>
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
                        Safeguarding the Future of Writing
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        AI text detection tools designed to support fair and responsible use of language technologies in education, research, and writing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/signin"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            Login
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
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