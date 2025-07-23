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
import { Modal } from "../../ui/modal";
import { useModal } from "../../../hooks/useModal";

// Updated interface to match your actual API model
interface AnalysisResultData {
  id: number;
  text: string;
  flask_prediction: string;
  flask_confidence: {
    ai: number; // Changed from ai_probability to ai
    human: number; // Changed from human_probability to human
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

  // Use the custom modal hook
  const { isOpen: showDetailModal, openModal, closeModal } = useModal();

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
    openModal();
    handleMenuClose();
  };

  const handleCloseModal = () => {
    closeModal();
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

  // Helper function to get AI and Human percentages from flask confidence
  const getConfidencePercentages = (confidence: { ai: number; human: number }) => {
    if (confidence && confidence.ai !== undefined && confidence.human !== undefined) {
      return {
        ai: Math.round(confidence.ai * 100),
        human: Math.round(confidence.human * 100)
      };
    }
    return { ai: 0, human: 0 };
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
                  AI / Human Probability
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
                  const percentages = getConfidencePercentages(result.flask_confidence);
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
                        <div className="space-y-2">
                          {/* AI Probability */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-red-600 w-8">AI:</span>
                            <span className="text-xs font-semibold w-10">{percentages.ai}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <div
                                className="bg-red-500 h-1.5 rounded-full"
                                style={{ width: `${percentages.ai}%` }}
                              ></div>
                            </div>
                          </div>
                          {/* Human Probability */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-green-600 w-8">Human:</span>
                            <span className="text-xs font-semibold w-10">{percentages.human}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{ width: `${percentages.human}%` }}
                              ></div>
                            </div>
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


      <Modal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        className="max-w-6xl mx-4 max-h-[90vh]"
      >
        {selectedResult && (
          <div className="flex flex-col max-h-[90vh]">
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Analysis Details
              </h3>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {/* Original Text */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Original Text</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedResult.text}
                  </p>
                </div>
              </div>

              {/* Flask Analysis */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Flask Analysis</h4>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Prediction:</span>
                    <Badge color={selectedResult.flask_prediction === 'AI' ? 'error' : 'success'}>
                      {selectedResult.flask_prediction}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">AI Probability:</span>
                        <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                          {getConfidencePercentages(selectedResult.flask_confidence).ai}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-600">
                        <div
                          className="bg-red-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${getConfidencePercentages(selectedResult.flask_confidence).ai}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Human Probability:</span>
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                          {getConfidencePercentages(selectedResult.flask_confidence).human}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-600">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${getConfidencePercentages(selectedResult.flask_confidence).human}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini Analysis */}
              {selectedResult.gemini_analysis && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Gemini Analysis</h4>
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
                      <div className="space-y-6">
                        {/* Linguistic Indicators */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Linguistic Indicators</h5>
                          <div className="space-y-4">
                            {parsedAnalysis.linguistic_indicators.map((indicator, index) => (
                              <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {indicator.pattern}
                                  </span>
                                  <Badge
                                    color={indicator.ai_likelihood === 'rendah' ? 'success' : indicator.ai_likelihood === 'tinggi' ? 'error' : 'warning'}
                                    size="sm"
                                  >
                                    {indicator.ai_likelihood}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {indicator.description}
                                </p>
                                {indicator.examples && indicator.examples.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Examples: </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {indicator.examples.join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Vocabulary Analysis */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Vocabulary Analysis</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">Complexity: </span>
                                <Badge color={parsedAnalysis.vocabulary_analysis.complexity === 'tinggi' ? 'error' : 'warning'} size="sm">
                                  {parsedAnalysis.vocabulary_analysis.complexity}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">Sentence Structure: </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {parsedAnalysis.vocabulary_analysis.sentence_structure}
                                </p>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Technical Terms: </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {parsedAnalysis.vocabulary_analysis.technical_terms.map((term, index) => (
                                  <Badge key={index} color="info" size="sm">
                                    {term}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Writing Style */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Writing Style</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Formality</span>
                              <Badge color="info" size="sm">{parsedAnalysis.writing_style.formality}</Badge>
                            </div>
                            <div className="text-center">
                              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Flow</span>
                              <Badge color="info" size="sm">{parsedAnalysis.writing_style.flow}</Badge>
                            </div>
                            <div className="text-center">
                              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Coherence</span>
                              <Badge color="success" size="sm">{parsedAnalysis.writing_style.coherence}</Badge>
                            </div>
                          </div>

                          {/* AI and Human Markers */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-red-600 dark:text-red-400">AI Markers:</span>
                              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                                {parsedAnalysis.writing_style.ai_markers.map((marker, index) => (
                                  <li key={index}>{marker}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-green-600 dark:text-green-400">Human Markers:</span>
                              {parsedAnalysis.writing_style.human_markers.length > 0 ? (
                                <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                                  {parsedAnalysis.writing_style.human_markers.map((marker, index) => (
                                    <li key={index}>{marker}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500 italic">No human markers detected</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Conclusion */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3">Conclusion</h5>
                          <div className="space-y-4">
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Primary Reason: </span>
                              <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                {parsedAnalysis.conclusion.primary_reason}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-gray-200">Confidence Explanation: </span>
                              <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                {parsedAnalysis.conclusion.confidence_explanation}
                              </p>
                            </div>
                            {parsedAnalysis.conclusion.recommendation && (
                              <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">Recommendation: </span>
                                <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                                  {parsedAnalysis.conclusion.recommendation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}