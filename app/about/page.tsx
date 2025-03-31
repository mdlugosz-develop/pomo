import { Card } from "@/components/ui/card"
import Script from 'next/script'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto pb-8">
      <Script id="about-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "The Pomodoro Technique: Boost Your Productivity",
          "description": "Learn about the Pomodoro Technique, a time management method that uses timed intervals of work and breaks to improve productivity and focus.",
          "image": "https://pomotime.io/images/logo.png",
          "author": {
            "@type": "Organization",
            "name": "PomoTime"
          },
          "publisher": {
            "@type": "Organization",
            "name": "PomoTime",
            "logo": {
              "@type": "ImageObject",
              "url": "https://pomotime.io/images/logo.png"
            }
          },
          "datePublished": "2023-12-24",
          "dateModified": "2023-12-24",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://pomotime.io/about"
          }
        })
      }} />

      <h1 className="text-3xl font-bold mb-6">The Pomodoro Technique</h1>

      <div className="prose lg:prose-lg max-w-none">
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">What is the Pomodoro Technique?</h2>
          <p className="mb-4">
          <a href="https://www.pomodorotechnique.com/#" style={{ color: 'blue', fontWeight: 'bold' }}>The Pomodoro Technique</a> is a time management method developed by Francesco Cirillo in the late 1980s. 
            
            The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, 
            separated by short breaks of 5 minutes. Each interval is known as a "pomodoro," the Italian word for tomato, 
            after the tomato-shaped kitchen timer that Cirillo used as a university student.
          </p>
          <p>
            This method is based on the idea that frequent breaks can improve mental agility and that a 
            decided time frame can help focus and limit distractions.
          </p>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How Does It Work?</h2>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li><strong>Choose a task</strong> you'd like to get done</li>
            <li><strong>Set the timer</strong> for 25 minutes</li>
            <li><strong>Work on the task</strong> until the timer rings</li>
            <li>When the timer rings, <strong>put a checkmark</strong> on a piece of paper</li>
            <li><strong>Take a short break</strong> (5 minutes)</li>
            <li>After four pomodoros, <strong>take a longer break</strong> (15-30 minutes)</li>
          </ol>
          <p>
            The technique's simplicity and effectiveness have made it popular worldwide, and it has been adapted 
            into numerous applications and digital tools, including PomoTime.
          </p>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Benefits of the Pomodoro Technique</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Improved Focus:</strong> By working in short, focused intervals, you train your brain to concentrate for short periods.</li>
            <li><strong>Reduced Distractions:</strong> The time constraint helps you resist self-interruptions and re-trains your brain to avoid distractions.</li>
            <li><strong>Better Planning:</strong> Breaking down work into manageable chunks helps with more accurate time estimation and planning.</li>
            <li><strong>Increased Accountability:</strong> Recording completed pomodoros creates a tangible record of your work.</li>
            <li><strong>Reduced Mental Fatigue:</strong> Regular breaks help maintain mental freshness and prevent burnout.</li>
            <li><strong>Improved Work-Life Balance:</strong> Clear boundaries between work and rest time help maintain a healthy balance.</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Get Started with PomoTime</h2>
          <p className="mb-4">
            PomoTime is designed to help you implement the Pomodoro Technique effectively. Our app provides:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Customizable work and break intervals</li>
            <li>Task management integrated with the Pomodoro timer</li>
            <li>Progress tracking and statistics</li>
            <li>Clean, distraction-free interface</li>
          </ul>
          <div className="mt-6">
            <Link 
              href="/" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Using PomoTime Now
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
} 