import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

// Mock case data
const rawCases = [
  {
    id: 'CNR2023/001',
    title: 'State vs. Ramesh Kumar',
    dsr: 950,
    age: 67,
    rightsViolation: 95,
    vulnerability: 80,
    severity: 60,
    adjournments: 12,
    status: 'Undertrial',
    offense: 'Theft (₹500)',
    maxSentence: 180,
    timeServed: 850,
    court: 'District Court, Patna',
    judge: 'Hon. Justice M.K. Sharma',
    filingDate: '12 Aug 2023',
    arrestDate: '20 Nov 2023',
    nextHearing: '15 Apr 2026',
    sections: 'IPC Section 379',
    summary: {
      background: 'Ramesh Kumar, a 67-year-old daily wage laborer from a rural village in Bihar, was arrested on 20th November 2023 for allegedly stealing groceries worth ₹500 from a local shop. The case was filed on 12th August 2023 based on a complaint. He could not afford bail of ₹10,000 and has remained in Beur Central Jail since his arrest.',
      currentSituation: 'Despite the maximum punishment for this offense being only 6 months (180 days), Ramesh Kumar has now spent 850 days (over 2.3 years) in pre-trial detention. His family has lost their sole breadwinner, and his wife has been forced to work as a domestic helper to feed their three children.',
      legalIssues: 'This case represents a textbook violation of Section 436A of CrPC (now Section 479 of BNSS), which mandates release on personal bond when an undertrial has served half the maximum sentence. The accused has served 4.7 times the maximum sentence while still awaiting trial.',
      humanImpact: 'The accused suffers from diabetes and hypertension, with limited access to proper medical care in prison. His eldest daughter had to drop out of college due to financial constraints. The family has accumulated debt of over ₹2 lakhs for legal fees.'
    },
    injustice: [
      'Time served (850 days) exceeds maximum sentence (180 days) by 670 days',
      'Section 436A CrPC mandate for release completely ignored',
      'Elderly accused (67 years) with chronic health conditions',
      'Economically disadvantaged - daily wage laborer earning ₹300/day',
      '12 adjournments with no substantial progress in trial',
      'Right to speedy trial under Article 21 grossly violated',
      'Bail amount set without considering economic status'
    ],
    whyUrgent: [
      'Constitutional crisis: Detention exceeds legal maximum by 4.7x',
      'Health emergency: Diabetic patient without proper medication',
      'Age factor: 67 years old, vulnerable to prison conditions',
      'Family humanitarian crisis: Children\'s education affected',
      'Clear procedural failure: 12 adjournments over 2+ years'
    ]
  },
  {
    id: 'CNR2023/045',
    title: 'State vs. Priya Singh',
    dsr: 780,
    age: 45,
    rightsViolation: 70,
    vulnerability: 90,
    severity: 50,
    adjournments: 8,
    status: 'Bail Pending',
    offense: 'Property Dispute',
    maxSentence: 365,
    timeServed: 620,
    court: 'Sessions Court, Mumbai',
    judge: 'Hon. Justice R.K. Patel',
    filingDate: '03 Feb 2024',
    arrestDate: '15 May 2024',
    nextHearing: '22 Apr 2026',
    sections: 'IPC Section 420, 406',
    summary: {
      background: 'Priya Singh, a 45-year-old single mother of two children (ages 12 and 15), was arrested on 15th May 2024 in connection with a property dispute with her former employer. She worked as a domestic helper and was accused of misappropriating household items worth ₹15,000 during her employment.',
      currentSituation: 'Priya has been in Mumbai Central Prison for 620 days awaiting trial. Her two children are currently staying with her elderly mother (72 years) in a one-room tenement in Dharavi. The children have had to take up part-time work after school to support themselves.',
      legalIssues: 'The bail application has been pending for over 18 months despite the accused being a first-time offender with no flight risk. The delay appears to be primarily due to the complainant\'s influence and repeated adjournments requested by the prosecution.',
      humanImpact: 'The children\'s academic performance has deteriorated significantly. The elder child (15) has been diagnosed with depression. The family survives on ₹4,000/month earned by the grandmother through stitching work. They have not been able to afford a private lawyer.'
    },
    injustice: [
      'Bail pending for 620 days despite being first-time offender',
      'Time served (620 days) exceeds maximum sentence (365 days)',
      'Single mother with two dependent minor children',
      'Economically disadvantaged - former domestic worker',
      '8 adjournments causing unnecessary trial delays',
      'Children left without parental care',
      'Complainant\'s influence affecting bail decisions'
    ],
    whyUrgent: [
      'Humanitarian concern: Minor children without mother for 2 years',
      'Time served already exceeds maximum possible sentence',
      'Vulnerable accused: Single mother, no family support',
      'Mental health impact on children documented',
      'Non-violent offense with disproportionate detention'
    ]
  },
  {
    id: 'CNR2024/203',
    title: 'State vs. Anjali Mehta',
    dsr: 820,
    age: 58,
    rightsViolation: 85,
    vulnerability: 75,
    severity: 40,
    adjournments: 10,
    status: 'Bail Denied',
    offense: 'Financial Fraud (Alleged)',
    maxSentence: 365,
    timeServed: 720,
    court: 'Economic Offences Court, Bangalore',
    judge: 'Hon. Justice S.N. Reddy',
    filingDate: '15 Mar 2024',
    arrestDate: '10 Apr 2024',
    nextHearing: '18 Apr 2026',
    sections: 'IPC Section 420, 468, 471',
    summary: {
      background: 'Anjali Mehta, a 58-year-old retired school teacher, was arrested on 10th April 2024 for alleged financial fraud involving a chit fund scheme. She was one of 47 investors who collectively filed a complaint, but was later implicated as an "agent" based on testimony from the main accused who is still absconding.',
      currentSituation: 'Despite being a retiree with no criminal history, Anjali has spent 720 days in Bangalore Central Prison. Her husband (62 years) suffered a heart attack three months after her arrest and is currently bedridden. Their only son works in the US and has been unable to visit.',
      legalIssues: 'Bail has been denied twice citing "severity of economic offense" despite no direct evidence linking her to the fraud. The main accused remains absconding while she, a peripheral figure, remains incarcerated. Her pension (only source of family income) has been frozen.',
      humanImpact: 'The accused has developed severe anxiety and depression in prison. Her bedridden husband is being cared for by neighbors. The family home is at risk of foreclosure due to unpaid EMIs. She has lost 15 kg since incarceration due to stress and poor prison diet.'
    },
    injustice: [
      'Time served (720 days) nearly double maximum sentence (365 days)',
      'Main accused absconding while peripheral figure detained',
      'Retired school teacher with 35 years of service record',
      'Health deterioration: Severe anxiety, depression, weight loss',
      '10 adjournments with prosecution repeatedly unprepared',
      'Pension frozen leaving bedridden husband without support',
      'Bail denied despite no flight risk or criminal history'
    ],
    whyUrgent: [
      'Detention grossly exceeds legal limits (2x maximum)',
      'Health emergency: Both accused and spouse critically ill',
      'Injustice: Main accused free while minor participant jailed',
      'Family crisis: Bedridden spouse without care',
      'Economic devastation: Home foreclosure imminent'
    ]
  },
  {
    id: 'CNR2024/112',
    title: 'State vs. Vikram Rao',
    dsr: 200,
    age: 32,
    rightsViolation: 20,
    vulnerability: 30,
    severity: 85,
    adjournments: 3,
    status: 'Trial Ongoing',
    offense: 'Assault (Grievous Hurt)',
    maxSentence: 730,
    timeServed: 180,
    court: 'Criminal Court, Delhi',
    judge: 'Hon. Justice A.K. Verma',
    filingDate: '05 Oct 2025',
    arrestDate: '25 Oct 2025',
    nextHearing: '10 Apr 2026',
    sections: 'IPC Section 325, 326',
    summary: {
      background: 'Vikram Rao, a 32-year-old construction supervisor, was arrested on 25th October 2025 following an altercation at a construction site that resulted in serious injuries to a co-worker. The incident occurred during a dispute over wages owed to daily laborers.',
      currentSituation: 'The accused has been in Tihar Jail for 180 days. The trial is progressing at a reasonable pace with 3 hearings completed. Key witnesses have been examined, and the medical evidence has been presented. The case is expected to reach conclusion within 6-8 months.',
      legalIssues: 'The case involves grievous hurt with a maximum sentence of 2 years. The accused has cooperated with investigations and has no prior criminal record. The trial timeline is within acceptable norms for such cases.',
      humanImpact: 'While detention has caused hardship, the accused\'s family (wife and one child) are being supported by his extended family. The accused has access to legal aid and the trial is proceeding without undue delays.'
    },
    injustice: [
      'Time served (180 days) within reasonable limits for case severity',
      'Trial progressing at acceptable pace'
    ],
    whyUrgent: [
      'Violent offense requires timely resolution',
      'Evidence preservation is time-sensitive',
      'Witnesses available and cooperating',
      'Victim\'s family awaiting justice'
    ]
  }
]

// Calculate U-Score dynamically
const calculateUScore = (caseData) => {
  const dsrScore = Math.min(caseData.dsr / 10, 100)
  const ageScore = Math.min(caseData.age, 100)
  const rightsScore = caseData.rightsViolation
  const vulnerabilityScore = caseData.vulnerability
  const severityScore = caseData.severity
  const adjournmentsScore = Math.min(caseData.adjournments * 8, 100)

  const uScore = (
    (dsrScore * 0.30) +
    (ageScore * 0.20) +
    (rightsScore * 0.20) +
    (vulnerabilityScore * 0.15) +
    (severityScore * 0.10) +
    (adjournmentsScore * 0.05)
  )

  return Math.round(uScore)
}

// Progress Ring Component
const ProgressRing = ({ score, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  
  const getColor = (score) => {
    if (score >= 70) return '#ef4444'
    if (score >= 50) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${score >= 70 ? 'text-red-500' : score >= 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
          {score}
        </span>
      </div>
    </div>
  )
}

function App() {
  const [selectedCase, setSelectedCase] = useState(null)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [courtFilter, setCourtFilter] = useState('all')
  
  // Theme state
  const [darkMode, setDarkMode] = useState(true)

  // Fetch cases from API (with fallback to mock data)
  useEffect(() => {
    fetch('/api/cases')
      .then(res => {
        if (!res.ok) throw new Error('Backend not available')
        return res.json()
      })
      .then(data => {
        const processedCases = data
          .map(c => ({ ...c, uScore: calculateUScore(c) }))
          .sort((a, b) => b.uScore - a.uScore)
        setCases(processedCases)
        setLoading(false)
      })
      .catch(err => {
        console.warn('API not available, using mock data:', err.message)
        const processedCases = rawCases
          .map(c => ({ ...c, uScore: calculateUScore(c) }))
          .sort((a, b) => b.uScore - a.uScore)
        setCases(processedCases)
        setLoading(false)
      })
  }, [])

  // Filter cases
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = !searchQuery || 
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.offense.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPriority = priorityFilter === 'all' ||
      (priorityFilter === 'critical' && caseItem.uScore >= 70) ||
      (priorityFilter === 'medium' && caseItem.uScore >= 50 && caseItem.uScore < 70) ||
      (priorityFilter === 'low' && caseItem.uScore < 50)
    
    const matchesCourt = courtFilter === 'all' || 
      caseItem.court.includes(courtFilter)
    
    return matchesSearch && matchesPriority && matchesCourt
  })

  const getUrgencyColor = (score) => {
    if (score >= 70) return 'from-red-600 to-red-700'
    if (score >= 50) return 'from-amber-500 to-amber-600'
    return 'from-emerald-600 to-emerald-700'
  }

  const getUrgencyBorder = (score) => {
    if (score >= 70) return 'border-red-500/50'
    if (score >= 50) return 'border-amber-500/50'
    return 'border-emerald-500/50'
  }

  const getUrgencyBg = (score) => {
    if (score >= 70) return 'bg-red-500/5 border-red-500/20'
    if (score >= 50) return 'bg-amber-500/5 border-amber-500/20'
    return 'bg-emerald-500/5 border-emerald-500/20'
  }

  const getUrgencyLabel = (score) => {
    if (score >= 70) return 'CRITICAL'
    if (score >= 50) return 'MEDIUM'
    return 'LOW'
  }

  const getUrgencyText = (score) => {
    if (score >= 70) return 'text-red-500'
    if (score >= 50) return 'text-amber-500'
    return 'text-emerald-500'
  }

  const getProgressColor = (score) => {
    if (score >= 70) return 'bg-red-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  // Dashboard metrics
  const criticalCases = cases.filter(c => c.uScore >= 70).length
  const mediumCases = cases.filter(c => c.uScore >= 50 && c.uScore < 70).length
  const lowCases = cases.filter(c => c.uScore < 50).length
  const violationCases = cases.filter(c => c.timeServed > c.maxSentence)
  const totalViolationDays = violationCases.reduce((sum, c) => sum + (c.timeServed - c.maxSentence), 0)
  const avgPendingDays = Math.round(cases.reduce((sum, c) => sum + c.dsr, 0) / cases.length)
  const totalAdjournments = cases.reduce((sum, c) => sum + c.adjournments, 0)

  // Calculate dimension scores
  const calculateDimensionScores = (caseData) => {
    return [
      {
        name: 'Days Since Registration',
        shortName: 'DSR',
        icon: '📅',
        rawValue: caseData.dsr,
        displayValue: `${caseData.dsr} days`,
        score: Math.min((caseData.dsr / 10), 100),
        weight: 30,
        weightedScore: Math.min((caseData.dsr / 10), 100) * 0.30,
        description: 'How long since case was filed'
      },
      {
        name: 'Age of Accused',
        shortName: 'Age',
        icon: '👤',
        rawValue: caseData.age,
        displayValue: `${caseData.age} years`,
        score: Math.min(caseData.age, 100),
        weight: 20,
        weightedScore: Math.min(caseData.age, 100) * 0.20,
        description: 'Elderly individuals need priority'
      },
      {
        name: 'Rights Violation Index',
        shortName: 'Rights',
        icon: '⚖️',
        rawValue: caseData.rightsViolation,
        displayValue: `${caseData.rightsViolation}/100`,
        score: caseData.rightsViolation,
        weight: 20,
        weightedScore: caseData.rightsViolation * 0.20,
        description: 'Article 21 - Right to speedy trial'
      },
      {
        name: 'Vulnerability Index',
        shortName: 'Vulnerability',
        icon: '🛡️',
        rawValue: caseData.vulnerability,
        displayValue: `${caseData.vulnerability}/100`,
        score: caseData.vulnerability,
        weight: 15,
        weightedScore: caseData.vulnerability * 0.15,
        description: 'Economic & social disadvantage'
      },
      {
        name: 'Offense Severity',
        shortName: 'Severity',
        icon: '⚠️',
        rawValue: caseData.severity,
        displayValue: `${caseData.severity}/100`,
        score: caseData.severity,
        weight: 10,
        weightedScore: caseData.severity * 0.10,
        description: 'Gravity of alleged offense'
      },
      {
        name: 'Adjournment Count',
        shortName: 'Adjournments',
        icon: '🔄',
        rawValue: caseData.adjournments,
        displayValue: `${caseData.adjournments} times`,
        score: Math.min(caseData.adjournments * 8, 100),
        weight: 5,
        weightedScore: Math.min(caseData.adjournments * 8, 100) * 0.05,
        description: 'Procedural delays count'
      }
    ]
  }

  // Export to PDF function
  const exportToPDF = (caseData) => {
    const content = `
COURTCLOCK - CASE ANALYSIS REPORT
================================

Case ID: ${caseData.id}
Title: ${caseData.title}
U-Score: ${caseData.uScore} (${getUrgencyLabel(caseData.uScore)} PRIORITY)

CASE DETAILS
------------
Court: ${caseData.court}
Judge: ${caseData.judge}
Filing Date: ${caseData.filingDate}
Arrest Date: ${caseData.arrestDate}
Next Hearing: ${caseData.nextHearing}
Sections: ${caseData.sections}
Status: ${caseData.status}
Offense: ${caseData.offense}

KEY METRICS
-----------
Days Since Filing: ${caseData.dsr} days
Days in Custody: ${caseData.timeServed} days
Maximum Sentence: ${caseData.maxSentence} days
Age of Accused: ${caseData.age} years
Adjournments: ${caseData.adjournments}

CASE SUMMARY
------------
Background: ${caseData.summary.background}

Current Situation: ${caseData.summary.currentSituation}

Legal Issues: ${caseData.summary.legalIssues}

Human Impact: ${caseData.summary.humanImpact}

VIOLATIONS & INJUSTICE
----------------------
${caseData.injustice.map((item, i) => `${i + 1}. ${item}`).join('\n')}

WHY IMMEDIATE ATTENTION NEEDED
------------------------------
${caseData.whyUrgent.map((item, i) => `${i + 1}. ${item}`).join('\n')}

---
Generated by CourtClock AI-Powered Case Prioritization Engine
Date: ${new Date().toLocaleDateString()}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CourtClock_${caseData.id.replace('/', '_')}_Report.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-bounce">⚖️</div>
          <div className="text-2xl font-bold text-white mb-2">CourtClock</div>
          <div className="text-slate-400">Loading cases...</div>
          <div className="mt-6 flex justify-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Detail View
  if (selectedCase) {
    const dimensions = calculateDimensionScores(selectedCase)
    const totalWeightedScore = dimensions.reduce((sum, d) => sum + d.weightedScore, 0)
    const daysOverLimit = selectedCase.timeServed - selectedCase.maxSentence
    const daysUntilViolation = selectedCase.maxSentence - selectedCase.timeServed

    const barData = {
      labels: ['Time Served (Custody)', 'Maximum Sentence'],
      datasets: [
        {
          label: 'Days',
          data: [selectedCase.timeServed, selectedCase.maxSentence],
          backgroundColor: [
            selectedCase.timeServed > selectedCase.maxSentence ? 'rgba(239, 68, 68, 0.8)' : 'rgba(202, 138, 4, 0.8)',
            'rgba(71, 85, 105, 0.6)'
          ],
          borderColor: [
            selectedCase.timeServed > selectedCase.maxSentence ? 'rgba(239, 68, 68, 1)' : 'rgba(202, 138, 4, 1)',
            'rgba(71, 85, 105, 1)'
          ],
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    }

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b px-8 py-5`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedCase(null)}
                className={`flex items-center gap-2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
              >
                <span className="text-xl">←</span>
                <span>Back to Docket</span>
              </button>
            </div>
            <div className="flex items-center gap-6">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              {/* Export Button */}
              <button
                onClick={() => exportToPDF(selectedCase)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <span>📄</span>
                <span>Export Report</span>
              </button>
              
              <div className="text-right">
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} mb-1`}>URGENCY SCORE</div>
                <div className={`text-4xl font-bold ${getUrgencyText(selectedCase.uScore)}`}>
                  U-{selectedCase.uScore}
                </div>
              </div>
              <span className={`px-4 py-2 rounded text-sm font-semibold bg-gradient-to-r ${getUrgencyColor(selectedCase.uScore)} text-white`}>
                {getUrgencyLabel(selectedCase.uScore)}
              </span>
            </div>
          </div>
        </header>

        {/* Predictive Alert Banner */}
        {selectedCase.timeServed > selectedCase.maxSentence ? (
          <div className="bg-red-600 text-white px-8 py-3 animate-pulse">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <span className="font-semibold">CRITICAL ALERT:</span>
              <span>This accused has been in custody for {daysOverLimit} days BEYOND the maximum sentence. Immediate judicial intervention required under Section 436A CrPC.</span>
            </div>
          </div>
        ) : daysUntilViolation <= 30 ? (
          <div className="bg-amber-500 text-white px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="font-semibold">WARNING:</span>
              <span>If not heard within {daysUntilViolation} days, this case will violate Section 436A CrPC (custody exceeding max sentence).</span>
            </div>
          </div>
        ) : null}

        <div className="max-w-7xl mx-auto p-8">
          {/* Case Header */}
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-8 mb-8 shadow-xl animate-fadeIn`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-mono ${darkMode ? 'text-slate-500 bg-slate-800' : 'text-gray-500 bg-gray-100'} px-3 py-1 rounded`}>{selectedCase.id}</span>
                  <span className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>•</span>
                  <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{selectedCase.sections}</span>
                </div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{selectedCase.title}</h2>
                <p className="text-lg text-amber-500">{selectedCase.offense}</p>
              </div>
              <ProgressRing score={selectedCase.uScore} size={100} strokeWidth={8} />
            </div>
            
            <div className="grid grid-cols-6 gap-4 text-sm">
              {[
                { label: 'Court', value: selectedCase.court },
                { label: 'Judge', value: selectedCase.judge },
                { label: 'Filing Date', value: selectedCase.filingDate },
                { label: 'Arrest Date', value: selectedCase.arrestDate },
                { label: 'Status', value: selectedCase.status, highlight: 'amber' },
                { label: 'Next Hearing', value: selectedCase.nextHearing, highlight: 'emerald' }
              ].map((item, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className={`${darkMode ? 'text-slate-500' : 'text-gray-500'} text-xs mb-1`}>{item.label}</div>
                  <div className={`font-medium ${item.highlight === 'amber' ? 'text-amber-400' : item.highlight === 'emerald' ? 'text-emerald-400' : darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Detailed Case Summary */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-8 shadow-xl`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-3`}>
                  <span className="text-2xl">📋</span> Detailed Case Summary
                </h3>
                
                <div className="space-y-6">
                  {[
                    { label: 'Background', content: selectedCase.summary.background, color: 'amber' },
                    { label: 'Current Situation', content: selectedCase.summary.currentSituation, color: 'amber' },
                    { label: 'Legal Issues', content: selectedCase.summary.legalIssues, color: 'red' },
                    { label: 'Human Impact', content: selectedCase.summary.humanImpact, color: 'amber' }
                  ].map((section, idx) => (
                    <div key={idx} className="animate-slideIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <h4 className={`text-sm font-semibold ${section.color === 'red' ? 'text-red-500' : 'text-amber-500'} uppercase tracking-wider mb-3`}>{section.label}</h4>
                      <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'} leading-relaxed`}>
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6-Dimensional Analysis */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-8 shadow-xl`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-3`}>
                  <span className="text-2xl">🎯</span> 
                  6-Dimensional Urgency Analysis
                </h3>
                
                <div className="space-y-4">
                  {dimensions.map((dimension, idx) => (
                    <div 
                      key={idx} 
                      className={`${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 hover:scale-[1.02] transition-transform`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{dimension.icon}</span>
                          <div>
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dimension.name}</div>
                            <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{dimension.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-500">{dimension.displayValue}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className={`relative h-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden mb-2`}>
                        <div 
                          className={`h-full ${getProgressColor(dimension.score)} transition-all duration-1000`}
                          style={{ width: `${dimension.score}%` }}
                        ></div>
                      </div>

                      <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        <span>Score: <span className={`${darkMode ? 'text-slate-300' : 'text-gray-700'} font-medium`}>{dimension.score.toFixed(1)}/100</span></span>
                        <span>Weight: <span className={`${darkMode ? 'text-slate-300' : 'text-gray-700'} font-medium`}>{dimension.weight}%</span></span>
                        <span>Contribution: <span className="text-amber-500 font-semibold">+{dimension.weightedScore.toFixed(2)}</span></span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Score */}
                <div className={`mt-6 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'} rounded-lg p-6 border border-amber-500/30`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} uppercase tracking-wider mb-1`}>Calculated U-Score</div>
                      <div className={`text-5xl font-bold ${getUrgencyText(selectedCase.uScore)}`}>
                        {Math.round(totalWeightedScore)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} mb-2`}>Priority Classification</div>
                      <span className={`px-4 py-2 rounded text-sm font-bold bg-gradient-to-r ${getUrgencyColor(selectedCase.uScore)} text-white`}>
                        {getUrgencyLabel(selectedCase.uScore)}
                      </span>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-300'}`}>
                    <div className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-500'} font-mono`}>
                      Formula: (DSR×0.30) + (Age×0.20) + (Rights×0.20) + (Vulnerability×0.15) + (Severity×0.10) + (Adjournments×0.05)
                    </div>
                  </div>
                </div>
              </div>

              {/* Liberty Index */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-8 shadow-xl`}>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 flex items-center gap-3`}>
                  <span className="text-2xl">⏱️</span> Liberty Index
                </h3>
                <p className={`${darkMode ? 'text-slate-500' : 'text-gray-500'} text-sm mb-6`}>Comparing time spent in custody vs maximum possible sentence</p>
                
                <div className="h-64">
                  <Bar 
                    data={barData} 
                    options={{
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      scales: {
                        x: { 
                          beginAtZero: true,
                          ticks: { color: darkMode ? '#94a3b8' : '#6b7280' },
                          grid: { color: darkMode ? '#1e293b' : '#e5e7eb' }
                        },
                        y: {
                          ticks: { color: darkMode ? '#e2e8f0' : '#374151', font: { weight: '500' } },
                          grid: { display: false }
                        }
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>

                <div className={`mt-4 flex items-center justify-between text-sm`}>
                  <div>
                    <span className={`${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Case Filed: </span>
                    <span className={`${darkMode ? 'text-slate-300' : 'text-gray-700'} font-medium`}>{selectedCase.dsr} days ago</span>
                  </div>
                  <div>
                    <span className={`${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Time in Custody: </span>
                    <span className="text-amber-500 font-medium">{selectedCase.timeServed} days</span>
                  </div>
                </div>

                {selectedCase.timeServed > selectedCase.maxSentence && (
                  <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚨</span>
                      <div>
                        <div className="text-red-400 font-bold">SECTION 436A CrPC VIOLATION</div>
                        <div className="text-red-300/80 text-sm mt-1">
                          Time in custody ({selectedCase.timeServed} days) exceeds maximum sentence ({selectedCase.maxSentence} days) by <span className="font-bold text-white">{selectedCase.timeServed - selectedCase.maxSentence} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-6 shadow-xl">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                  <span>🤖</span> AI Insights
                </h3>
                <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-600'} space-y-3`}>
                  <p><strong className="text-amber-400">Why U-{selectedCase.uScore}?</strong></p>
                  <p>This case scores high because of {dimensions.sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 2).map(d => d.name.toLowerCase()).join(' and ')}.</p>
                  <p className="text-amber-400 font-medium">
                    {selectedCase.uScore >= 70 
                      ? '⚠️ Immediate hearing recommended within 7 days.'
                      : selectedCase.uScore >= 50
                      ? '📌 Schedule hearing within 30 days.'
                      : '✓ Normal case flow is acceptable.'}
                  </p>
                </div>
              </div>

              {/* Why Urgent */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-xl`}>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                  <span>⚡</span> Why Immediate Attention Needed
                </h3>
                <ul className="space-y-3">
                  {selectedCase.whyUrgent.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-amber-500 mt-0.5">→</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-gray-600'}>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Violations */}
              <div className={`border rounded-xl p-6 shadow-xl ${getUrgencyBg(selectedCase.uScore)}`}>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                  <span>⚠️</span> Violations & Injustice
                </h3>
                <ul className="space-y-2">
                  {selectedCase.injustice.map((item, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${darkMode ? 'bg-slate-900/50' : 'bg-white/50'} p-3 rounded`}>
                      <span className="text-red-500 mt-0.5">•</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-gray-600'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Metrics */}
              <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-xl`}>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>📊 Key Metrics</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Days Since Filing', value: selectedCase.dsr, color: 'white' },
                    { label: 'Days in Custody', value: selectedCase.timeServed, color: 'amber' },
                    { label: 'Age of Accused', value: `${selectedCase.age} yrs`, color: 'white' },
                    { label: 'Adjournments', value: selectedCase.adjournments, color: 'red' }
                  ].map((metric, idx) => (
                    <div key={idx} className={`flex justify-between items-center p-3 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'} rounded`}>
                      <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} text-sm`}>{metric.label}</span>
                      <span className={`text-xl font-bold ${metric.color === 'amber' ? 'text-amber-500' : metric.color === 'red' ? 'text-red-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">👨‍⚖️</div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI-Assisted Analysis</div>
                <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'} mt-1`}>
                  Final decision rests with the Hon'ble Court
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
          .animate-slideIn { animation: slideIn 0.4s ease-out forwards; opacity: 0; }
        `}</style>
      </div>
    )
  }

  // List View
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Alert Banner */}
      {violationCases.length > 0 && (
        <div className="bg-red-600 text-white px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🚨</span>
              <span className="font-semibold">ALERT:</span>
              <span>{violationCases.length} case(s) violating Section 436A CrPC - {totalViolationDays} total days over limit - Immediate action required!</span>
            </div>
            <button 
              onClick={() => setPriorityFilter('critical')}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
            >
              View All →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b px-8 py-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-bounce">⚖️</div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  CourtClock
                </h1>
                <p className={`${darkMode ? 'text-slate-500' : 'text-gray-500'} text-sm`}>
                  AI-Powered Case Prioritization Engine
                </p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-lg ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-gray-600'} hover:scale-110 transition-transform`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-6 gap-4">
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl p-4 hover:scale-105 transition-transform`}>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cases.length}</div>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Cases</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-red-500">{criticalCases}</div>
              <div className="text-sm text-red-400">Critical</div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-amber-500">{mediumCases}</div>
              <div className="text-sm text-amber-400">Medium</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 hover:scale-105 transition-transform">
              <div className="text-3xl font-bold text-emerald-500">{lowCases}</div>
              <div className="text-sm text-emerald-400">Low</div>
            </div>
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl p-4 hover:scale-105 transition-transform`}>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{avgPendingDays}</div>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Avg. Days Pending</div>
            </div>
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl p-4 hover:scale-105 transition-transform`}>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalAdjournments}</div>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Adjournments</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Search & Filter Bar */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6 shadow-xl`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Search Box */}
            <div className="md:col-span-1">
              <label className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} uppercase tracking-wider mb-2 block`}>Search Cases</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="CNR, Name, Offense..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <span className={`absolute right-3 top-2.5 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>🔍</span>
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} uppercase tracking-wider mb-2 block`}>Priority Filter</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`w-full ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
              >
                <option value="all">All Cases</option>
                <option value="critical">🔴 Critical Only</option>
                <option value="medium">🟡 Medium Only</option>
                <option value="low">🟢 Low Only</option>
              </select>
            </div>

            {/* Court Filter */}
            <div>
              <label className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'} uppercase tracking-wider mb-2 block`}>Court Filter</label>
              <select
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
                className={`w-full ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
              >
                <option value="all">All Courts</option>
                <option value="Patna">District Court, Patna</option>
                <option value="Mumbai">Sessions Court, Mumbai</option>
                <option value="Bangalore">Economic Offences Court, Bangalore</option>
                <option value="Delhi">Criminal Court, Delhi</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || priorityFilter !== 'all' || courtFilter !== 'all') && (
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-gray-200'} flex items-center gap-3 flex-wrap`}>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>Active Filters:</span>
              {searchQuery && (
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs">
                  Search: "{searchQuery}"
                </span>
              )}
              {priorityFilter !== 'all' && (
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs capitalize">
                  Priority: {priorityFilter}
                </span>
              )}
              {courtFilter !== 'all' && (
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs">
                  Court: {courtFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setPriorityFilter('all')
                  setCourtFilter('all')
                }}
                className="text-xs text-red-400 hover:text-red-300 underline ml-auto"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Prioritized Docket</h2>
          <span className={`${darkMode ? 'text-slate-500' : 'text-gray-500'} text-sm`}>
            Showing {filteredCases.length} of {cases.length} cases • Sorted by U-Score
          </span>
        </div>

        {/* Case List */}
        {filteredCases.length > 0 ? (
          <div className="space-y-4">
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem)}
                className={`group relative ${darkMode ? 'bg-slate-900' : 'bg-white'} border ${getUrgencyBorder(caseItem.uScore)} rounded-xl p-6 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Priority Badge */}
                <div className={`absolute -left-3 -top-3 w-10 h-10 bg-gradient-to-br ${getUrgencyColor(caseItem.uScore)} rounded-full flex items-center justify-center font-bold text-white text-sm border-4 ${darkMode ? 'border-slate-950' : 'border-gray-50'} shadow-lg`}>
                  {index + 1}
                </div>

                <div className="flex items-center justify-between ml-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-mono ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{caseItem.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r ${getUrgencyColor(caseItem.uScore)} text-white`}>
                        {getUrgencyLabel(caseItem.uScore)}
                      </span>
                      {caseItem.timeServed > caseItem.maxSentence && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white animate-pulse">
                          436A VIOLATION
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1 group-hover:text-amber-500 transition-colors`}>{caseItem.title}</h3>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'} mb-3`}>{caseItem.offense}</p>
                    
                    <div className={`flex items-center gap-6 text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      <span>Filed: <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>{caseItem.dsr} days ago</span></span>
                      <span>Custody: <span className="text-amber-500">{caseItem.timeServed} days</span></span>
                      <span>Age: <span className={darkMode ? 'text-slate-300' : 'text-gray-700'}>{caseItem.age} yrs</span></span>
                      <span>Adjournments: <span className="text-red-400">{caseItem.adjournments}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ProgressRing score={caseItem.uScore} size={80} strokeWidth={6} />
                    <div className={`text-2xl ${darkMode ? 'text-slate-600' : 'text-gray-300'} group-hover:text-amber-500 group-hover:translate-x-1 transition-all`}>
                      →
                    </div>
                  </div>
                </div>

                {caseItem.timeServed > caseItem.maxSentence && (
                  <div className="mt-4 ml-6 bg-red-500/10 border border-red-500/20 rounded px-4 py-2 flex items-center gap-2">
                    <span>🚨</span>
                    <span className="text-sm text-red-400">
                      Section 436A Violation: Custody ({caseItem.timeServed}d) exceeds max sentence ({caseItem.maxSentence}d) by <strong>{caseItem.timeServed - caseItem.maxSentence} days</strong>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border rounded-xl p-12 text-center`}>
            <div className="text-5xl mb-4">🔍</div>
            <div className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Cases Found</div>
            <div className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Try adjusting your search or filters</div>
            <button
              onClick={() => {
                setSearchQuery('')
                setPriorityFilter('all')
                setCourtFilter('all')
              }}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  )
}

export default App