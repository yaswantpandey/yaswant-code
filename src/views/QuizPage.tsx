import React, { useState } from 'react';
import { useLms } from '../context/LmsContext';
import { MOCK_QUIZ } from '../data/mockData';
import { 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  Award 
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const QuizPage: React.FC = () => {
  const { setCurrentView, addToast } = useLms();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = MOCK_QUIZ.questions;
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (optIndex: number) => {
    if (quizSubmitted) return;
    setSelectedOptionIndex(optIndex);
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optIndex }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setSelectedOptionIndex(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizSubmitted(true);
      addToast("Assessment Completed", "Your score has been computed!", "success");
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: totalQuestions,
      percentage: Math.round((correct / totalQuestions) * 100),
      passed: Math.round((correct / totalQuestions) * 100) >= MOCK_QUIZ.passingScore
    };
  };

  const result = calculateScore();

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setShowExplanation(false);
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="purple" size="sm">Technical Assessment</Badge>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white mt-1">
            {MOCK_QUIZ.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>{MOCK_QUIZ.durationMinutes}:00 Duration</span>
        </div>
      </div>

      {!quizSubmitted ? (
        /* Active Question Card */
        <GlassCard className="p-6 sm:p-8 space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-2">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="pt-2">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((optText, idx) => {
              const isSelected = selectedOptionIndex === idx || userAnswers[currentQ.id] === idx;
              const isCorrect = idx === currentQ.correctOptionIndex;

              let cardStyle = 'border-neutral-200/80 dark:border-neutral-750 bg-neutral-50/50 dark:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200';

              if (showExplanation) {
                if (isCorrect) {
                  cardStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-medium';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200';
                }
              } else if (isSelected) {
                cardStyle = 'border-neutral-900 dark:border-white bg-neutral-900/5 dark:bg-white/5 font-semibold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-start justify-between gap-3 ${cardStyle}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      {optionLetters[idx] || idx + 1}
                    </span>
                    <span className="leading-relaxed">{optText}</span>
                  </div>

                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-xs leading-relaxed space-y-1 animate-in fade-in">
              <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Architectural Principle
              </span>
              <p className="text-neutral-600 dark:text-neutral-300">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">
              Passing threshold: {MOCK_QUIZ.passingScore}%
            </span>

            <Button
              variant="primary"
              size="md"
              disabled={selectedOptionIndex === null && userAnswers[currentQ.id] === undefined}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={handleNext}
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Compute Final Score'}
            </Button>
          </div>
        </GlassCard>
      ) : (
        /* Results Screen */
        <GlassCard className="p-8 sm:p-12 text-center space-y-6">
          <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl ${
            result.passed ? 'bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-500'
          }`}>
            {result.passed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>

          <div>
            <Badge variant={result.passed ? 'success' : 'danger'} size="md">
              {result.passed ? 'Assessment Passed' : 'Needs Review'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white mt-3">
              {result.percentage}% Final Accuracy
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md mx-auto">
              You correctly solved {result.correct} out of {result.total} questions.
              {result.passed ? ' You satisfied the syllabus requirements for this chapter.' : ' A minimum score of 80% is required to unlock subsequent modules.'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="md"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={resetQuiz}
            >
              Retake Assessment
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => setCurrentView('learning-interface')}
            >
              Return to Course
            </Button>
          </div>
        </GlassCard>
      )}

    </div>
  );
};
