import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ClipboardCheck, BookOpen, AlertCircle, ArrowRight, ChevronRight, AlertTriangle, Clock, Ambulance } from 'lucide-react';

// Question categories and scoring weights
const questions = {
  urgentSymptoms: [
    { id: 'chest_pain', text: 'Are you experiencing chest pain or pressure?', weight: 5 },
    { id: 'breathing', text: 'Do you have severe difficulty breathing?', weight: 5 },
    { id: 'consciousness', text: 'Have you experienced any loss of consciousness?', weight: 5 },
  ],
  generalSymptoms: [
    { id: 'fever', text: 'Do you have a fever above 38°C (100.4°F)?', weight: 3 },
    { id: 'fatigue', text: 'Are you experiencing unusual fatigue or weakness?', weight: 2 },
    { id: 'appetite', text: 'Have you noticed significant changes in appetite?', weight: 2 },
  ]
};

type Answer = {
  [key: string]: number;
};

function Assessment() {
  const navigate = useNavigate();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const categories = Object.keys(questions);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;

    Object.entries(questions).forEach(([category, categoryQuestions]) => {
      categoryQuestions.forEach(question => {
        if (answers[question.id]) {
          totalScore += answers[question.id] * question.weight;
        }
        maxPossibleScore += 5 * question.weight; // 5 is max value on Likert scale
      });
    });

    const percentageScore = (totalScore / maxPossibleScore) * 100;

    // Determine triage category
    if (percentageScore >= 70) {
      return {
        urgency: 'red',
        color: 'red',
        iconName: 'Ambulance',
        message: 'Seek immediate medical attention or call emergency services.',
      };
    } else if (percentageScore >= 50) {
      return {
        urgency: 'black',
        color: 'black',
        iconName: 'AlertTriangle',
        message: 'Visit urgent care or schedule a same-day appointment with your doctor.',
      };
    } else if (percentageScore >= 30) {
      return {
        urgency: 'yellow',
        color: 'yellow',
        iconName: 'Clock',
        message: 'Schedule an appointment with your healthcare provider within the next few days.',
      };
    } else {
      return {
        urgency: 'green',
        color: 'green',
        iconName: 'AlertCircle',
        message: 'Monitor your symptoms and schedule a routine check-up if needed.',
      };
    }
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    } else {
      const result = calculateScore();
      navigate('/results', { state: { result } });
    }
  };

  const currentQuestions = questions[categories[currentCategory] as keyof typeof questions];
  const progress = ((currentCategory + 1) / categories.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Section {currentCategory + 1} of {categories.length}
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
          {categories[currentCategory].replace('_', ' ')}
        </h2>

        <div className="space-y-8">
          {currentQuestions.map(question => (
            <div key={question.id} className="space-y-4">
              <p className="text-lg text-gray-800">{question.text}</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(question.id, value)}
                    className={`p-3 rounded-lg transition-all ${
                      answers[question.id] === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Not at all</span>
                <span>Very much</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentCategory === categories.length - 1 ? 'See Results' : 'Next'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    navigate('/assessment');
    return null;
  }

  // Map icon names to components
  const iconComponents = {
    Ambulance,
    AlertTriangle,
    Clock,
    AlertCircle,
  };

  const ResultIcon = iconComponents[result.iconName as keyof typeof iconComponents];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className={`text-${result.color === 'black' ? 'gray-900' : result.color}-600 flex items-center justify-center mb-6`}>
          <ResultIcon className="h-16 w-16" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-4">
          {result.urgency} Care Recommended
        </h1>
        
        <p className="text-xl text-gray-700 text-center mb-8">
          {result.message}
        </p>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <ul className="space-y-3">
              {result.urgency === 'red' && (
                <>
                  <li>• Call emergency services (911) immediately</li>
                  <li>• Do not drive yourself to the hospital</li>
                  <li>• Stay calm and wait for help to arrive</li>
                </>
              )}
              {result.urgency === 'black' && (
                <>
                  <li>• Visit the nearest urgent care center</li>
                  <li>• Contact your primary care physician</li>
                  <li>• Monitor your symptoms closely</li>
                </>
              )}
              {result.urgency === 'yellow' && (
                <>
                  <li>• Schedule an appointment with your doctor</li>
                  <li>• Keep track of your symptoms</li>
                  <li>• Follow up within 2-3 days</li>
                </>
              )}
              {result.urgency === 'green' && (
                <>
                  <li>• Monitor your symptoms</li>
                  <li>• Practice self-care measures</li>
                  <li>• Schedule a routine check-up if needed</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate('/assessment')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  return (
    <>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Smart Medical Triage</span>
            <span className="block text-blue-600">For Better Healthcare</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get quick, reliable guidance on your health concerns. Our advanced triage system helps you make informed decisions about seeking medical care.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={handleStartAssessment}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <ClipboardCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Assessment</h3>
              <p className="mt-2 text-base text-gray-500">
                Answer simple questions about your symptoms for personalized guidance.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Instant Triage</h3>
              <p className="mt-2 text-base text-gray-500">
                Get immediate recommendations on the urgency of medical care needed.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Health Resources</h3>
              <p className="mt-2 text-base text-gray-500">
                Access educational materials and professional healthcare directories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to check your health?
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              Take our comprehensive health assessment to get personalized recommendations.
            </p>
            <button
              onClick={handleStartAssessment}
              className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">MedTriage</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/assessment" className="text-gray-700 hover:text-blue-600">Questionnaire</Link>
              <Link to="/resources" className="text-gray-700 hover:text-blue-600">Resources</Link>
              <Link to="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              © 2025 MedTriage. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;