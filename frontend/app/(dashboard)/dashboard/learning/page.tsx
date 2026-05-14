'use client'

import { Play, Clock, Award, CheckCircle, BookOpen, Video, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LearningPage() {
  const courses = [
    {
      id: 1,
      title: 'Building Your Economic Identity',
      desc: 'Learn how to build a strong economic identity score and unlock opportunities',
      icon: '📊',
      progress: 75,
      lessons: 8,
      duration: '2h 30m',
      completed: 6,
      color: 'from-trace-primary/10 to-trace-primary/5'
    },
    {
      id: 2,
      title: 'Financial Management 101',
      desc: 'Master the basics of personal finance and money management',
      icon: '💰',
      progress: 40,
      lessons: 10,
      duration: '3h 15m',
      completed: 4,
      color: 'from-trace-accent/10 to-trace-accent/5'
    },
    {
      id: 3,
      title: 'Growing Your Trade Business',
      desc: 'Strategies to scale your trading business and increase profits',
      icon: '📈',
      progress: 0,
      lessons: 12,
      duration: '4h',
      completed: 0,
      color: 'from-green-100 to-green-50'
    },
    {
      id: 4,
      title: 'Digital Skills for Gig Workers',
      desc: 'Essential digital skills to excel in the gig economy',
      icon: '💻',
      progress: 100,
      lessons: 6,
      duration: '2h',
      completed: 6,
      color: 'from-trace-primary/10 to-trace-surface'
    },
  ]

  const lessons = [
    { id: 1, title: 'What is Economic Identity?', duration: '12 min', type: 'video', completed: true },
    { id: 2, title: 'Factors That Build Your Score', duration: '15 min', type: 'video', completed: true },
    { id: 3, title: 'Work History Impact', duration: '10 min', type: 'article', completed: true },
    { id: 4, title: 'Financial Activity Guide', duration: '20 min', type: 'video', completed: true },
    { id: 5, title: 'Improving Your Rating', duration: '8 min', type: 'article', completed: true },
    { id: 6, title: 'Unlocking Opportunities', duration: '18 min', type: 'video', completed: true },
    { id: 7, title: 'Case Studies & Success Stories', duration: '25 min', type: 'video', completed: false },
    { id: 8, title: 'Next Steps Forward', duration: '14 min', type: 'article', completed: false },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Center</h1>
          <p className="text-muted-foreground">Master skills to grow your economic identity and earnings</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Recommended Course */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Continue Learning</h2>
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="sm:w-1/3">
              <div className="bg-trace-primary/10 rounded-lg h-48 flex items-center justify-center text-5xl">
                📊
              </div>
            </div>
            <div className="sm:w-2/3 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Building Your Economic Identity</h3>
                <p className="text-muted-foreground mb-6">You&apos;re 75% complete with this course. 2 more lessons to finish!</p>
              </div>
              <div>
                <div className="w-full h-3 bg-trace-surface rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-trace-primary w-3/4"></div>
                </div>
                <p className="text-sm text-muted-foreground mb-6">6 of 8 lessons completed</p>
                <Button className="bg-trace-primary hover:bg-trace-primary/90 font-bold">
                  <Play size={18} className="mr-2" /> Continue
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson List for Current Course */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h3 className="text-xl font-bold text-foreground mb-6">Course Lessons</h3>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-4 p-4 border border-trace-border/50 rounded-lg hover:border-trace-primary/50 transition cursor-pointer">
                <div className={`flex-shrink-0 ${lesson.completed ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {lesson.completed ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Play size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${lesson.completed ? 'text-foreground line-through opacity-60' : 'text-foreground'}`}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {lesson.type === 'video' ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Video size={14} /> Video
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText size={14} /> Article
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  </div>
                </div>
                {lesson.completed && <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">Completed</span>}
              </div>
            ))}
          </div>
        </div>

        {/* All Courses */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">All Courses</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className={`bg-gradient-to-br ${course.color} rounded-lg p-6 border border-trace-border hover:border-trace-primary/50 transition cursor-pointer`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{course.icon}</span>
                  {course.progress === 100 && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Completed</span>
                  )}
                </div>
                <h3 className="font-bold text-foreground mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.desc}</p>

                {course.progress > 0 && (
                  <div className="mb-4">
                    <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                      <div className="h-full bg-trace-primary" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{course.progress}% complete</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} /> {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {course.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg p-8 border border-trace-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Your Certifications</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: 'Economic Identity Master', date: 'Dec 2024', icon: '🏅' },
              { title: 'Digital Skills Expert', date: 'Dec 2024', icon: '🎖️' },
            ].map((cert, idx) => (
              <div key={idx} className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg border-2 border-yellow-400 text-center">
                <span className="text-5xl mb-4 block">{cert.icon}</span>
                <h3 className="font-bold text-foreground mb-2">{cert.title}</h3>
                <p className="text-sm text-muted-foreground">Earned on {cert.date}</p>
                <button className="mt-4 text-sm font-bold text-trace-primary hover:underline">View Certificate</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


