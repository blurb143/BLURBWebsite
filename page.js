'use client'

import { useEffect, useState } from 'react'
import { Camera, Video, Edit3, Mail, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'

const Home = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [bookingForm, setBookingForm] = useState({
    client_name: '',
    client_email: '',
    event_date: '',
    service_type: 'Photography',
    message: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      })

      if (response.ok) {
        toast({
          title: 'Booking Submitted',
          description: 'Thank you! We will be in touch soon.',
        })
        setBookingForm({
          client_name: '',
          client_email: '',
          event_date: '',
          service_type: 'Photography',
          message: ''
        })
      } else {
        throw new Error('Failed to submit booking')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit booking. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen">
      <Toaster />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center border-b border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black opacity-90" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-sm tracking-[0.3em] text-neutral-400 mb-6 uppercase">{getGreeting()}</p>
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6">
            Visual
            <br />
            <span className="italic font-serif">Storytelling</span>
          </h1>
          <p className="text-xl text-neutral-400 font-light tracking-wide mb-12">
            Photography · Videography · Editorial
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-black transition-all duration-300"
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
          >
            Start a Project
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-light tracking-tight mb-16 text-center">Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
              <CardContent className="p-8">
                <Camera className="h-12 w-12 mb-6 text-white" />
                <h3 className="text-2xl font-light mb-4">Photography</h3>
                <p className="text-neutral-400 font-light leading-relaxed">
                  Editorial portraits, commercial work, and event photography with a focus on natural light and composition.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
              <CardContent className="p-8">
                <Video className="h-12 w-12 mb-6 text-white" />
                <h3 className="text-2xl font-light mb-4">Videography</h3>
                <p className="text-neutral-400 font-light leading-relaxed">
                  Cinematic storytelling, brand films, and event coverage that captures authentic moments.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
              <CardContent className="p-8">
                <Edit3 className="h-12 w-12 mb-6 text-white" />
                <h3 className="text-2xl font-light mb-4">Editing</h3>
                <p className="text-neutral-400 font-light leading-relaxed">
                  Professional post-production, color grading, and retouching for photography and video.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 px-4 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <h2 className="text-4xl font-light tracking-tight">Portfolio</h2>
            <div className="flex gap-4">
              {['All', 'Photography', 'Videography', 'Editing'].map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'ghost'}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'bg-white text-black' : 'text-neutral-400'}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-neutral-400 py-12">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-neutral-400 py-12">
              <p className="text-lg">No projects yet.</p>
              <p className="text-sm mt-2">Check back soon or login to the admin panel to add projects.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id} className="bg-neutral-900 border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all group cursor-pointer">
                  <div className="aspect-square relative overflow-hidden bg-neutral-800">
                    {project.thumbnail_url ? (
                      <img 
                        src={project.thumbnail_url} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-16 w-16 text-neutral-700" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <p className="text-xs tracking-widest text-neutral-500 mb-2 uppercase">{project.category}</p>
                    <h3 className="text-xl font-light">{project.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact/Booking Section */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-light tracking-tight mb-4 text-center">Start a Project</h2>
          <p className="text-neutral-400 text-center mb-12">Let's create something memorable together.</p>
          
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-neutral-400">Your Name</Label>
                <Input 
                  id="name"
                  value={bookingForm.client_name}
                  onChange={(e) => setBookingForm({...bookingForm, client_name: e.target.value})}
                  className="bg-neutral-900 border-neutral-800 focus:border-neutral-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-400">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={bookingForm.client_email}
                  onChange={(e) => setBookingForm({...bookingForm, client_email: e.target.value})}
                  className="bg-neutral-900 border-neutral-800 focus:border-neutral-700"
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-neutral-400">Event Date</Label>
                <Input 
                  id="date"
                  type="date"
                  value={bookingForm.event_date}
                  onChange={(e) => setBookingForm({...bookingForm, event_date: e.target.value})}
                  className="bg-neutral-900 border-neutral-800 focus:border-neutral-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service" className="text-neutral-400">Service Type</Label>
                <Select 
                  value={bookingForm.service_type}
                  onValueChange={(value) => setBookingForm({...bookingForm, service_type: value})}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 focus:border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Videography">Videography</SelectItem>
                    <SelectItem value="Editing">Editing</SelectItem>
                    <SelectItem value="Multiple">Multiple Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-neutral-400">Project Details</Label>
              <Textarea 
                id="message"
                value={bookingForm.message}
                onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                className="bg-neutral-900 border-neutral-800 focus:border-neutral-700 min-h-32"
                placeholder="Tell us about your project..."
                required
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-white text-black hover:bg-neutral-200"
            >
              Submit Inquiry
              <Mail className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-neutral-500 text-sm tracking-wide">
            © {new Date().getFullYear()} Premium Portfolio. All rights reserved.
          </p>
          <div className="mt-4">
            <Button 
              variant="link" 
              className="text-neutral-400 hover:text-white"
              onClick={() => window.location.href = '/admin'}
            >
              Admin Login
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
