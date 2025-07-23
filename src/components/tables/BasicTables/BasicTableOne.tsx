import { useState, useEffect } from "react";
import Api from "../../../utils/Api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";

// Updated interface to match your API model
interface AnalysisResultData {
  id: number;
  text: string;
  flask_prediction: string;
  flask_confidence: {
    ai_probability: number;
    human_probability: number;
  };
  gemini_analysis: {
    analysis: string; // This contains the JSON string with detailed analysis
  };
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface DetailedAnalysis {
  linguistic_indicators: Array<{
    pattern: string;
    description: string;
    ai_likelihood: string;
    examples: string[];
  }>;
  vocabulary_analysis: {
    complexity: string;
    technical_terms: string[];
    repetitive_phrases: string[];
    sentence_structure: string;
  };
  writing_style: {
    formality: string;
    flow: string;
    coherence: string;
    human_markers: string[];
    ai_markers: string[];
  };
  conclusion: {
    primary_reason: string;
    confidence_explanation: string;
    recommendation: string;
  };
}

export default function BasicTableOne() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResultData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchAnalysisResults = async () => {
      try {
        setLoading(true);
        const response = await Api.get('/analysis-results');
        console.log('Fetched analysis results:', response.data);
        setAnalysisResults(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch analysis results');
        }
        console.error('Error fetching analysis results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResults();
  }, []);

  const handleMenuToggle = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  const handleViewDetails = (result: AnalysisResultData) => {
    setSelectedResult(result);
    setShowDetailModal(true);
    handleMenuClose();
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedResult(null);
  };

  // Helper function to parse Gemini analysis
  const parseGeminiAnalysis = (analysis: string): DetailedAnalysis | null => {
    try {
      // Extract JSON from the markdown code block
      const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Error parsing Gemini analysis:', error);
      return null;
    }
  };

  // Helper function to get AI percentage from flask confidence
  const getAIPercentage = (confidence: { ai_probability: number }) => {
    if (confidence && confidence.ai_probability) {
      return Math.round(confidence.ai_probability * 100);
    }
    return 0;
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Helper function to count words
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-8 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Text Sample
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Word Count
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  AI Probability
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Prediction
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {analysisResults.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No analysis results found
                  </TableCell>
                </TableRow>
              ) : (
                analysisResults.map((result) => {
                  const aiPercentage = getAIPercentage(result.flask_confidence);
                  const wordCount = countWords(result.text);
                  const createdDate = new Date(result.createdAt).toLocaleDateString();
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {truncateText(result.text)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {createdDate}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {wordCount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>{aiPercentage}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${
                                aiPercentage >= 80
                                  ? "bg-red-500"
                                  : aiPercentage >= 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${aiPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge
                          color={result.flask_prediction === 'AI' ? 'error' : 'success'}
                          size="sm"
                        >
                          {result.flask_prediction}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 relative">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleMenuToggle(result.id)}
                        >
                          <span className="text-xl font-bold">⋮</span>
                        </button>
                        {openMenuId === result.id && (
                          <div
                            className="absolute right-4 z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg dark:bg-gray-800 dark:border-gray-700"
                            onMouseLeave={handleMenuClose}
                          >
                            <button
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleViewDetails(result)}
                            >
                              View Details
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                handleMenuClose();
                                // Handle export
                                console.log('Export result:', result);
                              }}
                            >
                              Export
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                handleMenuClose();
                                // Handle delete
                                console.log('Delete result:', result.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Badge>
            Total: {analysisResults.length} analysis results
          </Badge>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analysis Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Original Text */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Original Text</h4>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {selectedResult.text}
                </p>
              </div>

              {/* Flask Analysis */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Flask Analysis</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Prediction:</span>
                    <Badge color={selectedResult.flask_prediction === 'AI' ? 'error' : 'success'}>
                      {selectedResult.flask_prediction}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">AI Probability:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {getAIPercentage(selectedResult.flask_confidence)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Gemini Analysis */}
              {selectedResult.gemini_analysis && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Gemini Analysis</h4>
                  {(() => {
                    const parsedAnalysis = parseGeminiAnalysis(selectedResult.gemini_analysis.analysis);
                    if (!parsedAnalysis) {
                      return (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300">
                            Unable to parse analysis data
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* Linguistic Indicators */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Linguistic Indicators</h5>
                          {parsedAnalysis.linguistic_indicators.map((indicator, index) => (
                            <div key={index} className="mb-3 last:mb-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {indicator.pattern}
                                </span>
                                <Badge 
                                  color={indicator.ai_likelihood === 'rendah' ? 'success' : 'warning'}
                                  size="sm"
                                >
                                  {indicator.ai_likelihood}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {indicator.description}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Vocabulary Analysis */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Vocabulary Analysis</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Complexity: </span>
                              <span className="text-gray-600 dark:text-gray-400">{parsedAnalysis.vocabulary_analysis.complexity}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Technical Terms: </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {parsedAnalysis.vocabulary_analysis.technical_terms.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Writing Style */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Writing Style</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Formality: </span>
                              <span className="text-gray-600 dark:text-gray-400">{parsedAnalysis.writing_style.formality}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Flow: </span>
                              <span className="text-gray-600 dark:text-gray-400">{parsedAnalysis.writing_style.flow}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Coherence: </span>
                              <span className="text-gray-600 dark:text-gray-400">{parsedAnalysis.writing_style.coherence}</span>
                            </div>
                          </div>
                        </div>

                        {/* Conclusion */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Conclusion</h5>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Primary Reason: </span>
                              <p className="text-gray-600 dark:text-gray-400">{parsedAnalysis.conclusion.primary_reason}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Confidence Explanation: </span>
                              <p className="text-gray-600 dark:text-gray-400">{parsedAnalysis.conclusion.confidence_explanation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}