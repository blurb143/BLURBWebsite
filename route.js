import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Helper to verify admin authentication
async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { authenticated: false, user: null }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  return { authenticated: !error && user !== null, user }
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // ============ PUBLIC ROUTES ============

    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'Photographer Portfolio API' }))
    }

    // Get all published projects (public)
    if (route === '/projects' && method === 'GET') {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Get single project (public)
    if (route.startsWith('/projects/') && method === 'GET') {
      const projectId = path[1]
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Submit booking inquiry (public)
    if (route === '/bookings' && method === 'POST') {
      const body = await request.json()
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_name: body.client_name,
          client_email: body.client_email,
          event_date: body.event_date,
          service_type: body.service_type,
          message: body.message,
          status: 'New'
        })
        .select()
        .single()

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Cloudinary signature generation (authenticated)
    if (route === '/cloudinary/signature' && method === 'GET') {
      const { authenticated } = await verifyAdmin(request)
      if (!authenticated) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const url = new URL(request.url)
      const resourceType = url.searchParams.get('resource_type') || 'image'
      const folder = 'portfolio'

      const timestamp = Math.floor(Date.now() / 1000)
      const crypto = require('crypto')
      
      const params = `folder=${folder}&timestamp=${timestamp}`
      const signature = crypto
        .createHash('sha1')
        .update(params + process.env.CLOUDINARY_API_SECRET)
        .digest('hex')

      return handleCORS(NextResponse.json({
        signature,
        timestamp,
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        folder,
        resource_type: resourceType
      }))
    }

    // ============ ADMIN ROUTES (Protected) ============

    // Create project
    if (route === '/admin/projects' && method === 'POST') {
      const { authenticated } = await verifyAdmin(request)
      if (!authenticated) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: body.title,
          category: body.category,
          media_url: body.media_url,
          thumbnail_url: body.thumbnail_url
        })
        .select()
        .single()

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Update project
    if (route.startsWith('/admin/projects/') && method === 'PUT') {
      const { authenticated } = await verifyAdmin(request)
      if (!authenticated) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const projectId = path[2]
      const body = await request.json()
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: body.title,
          category: body.category,
          media_url: body.media_url,
          thumbnail_url: body.thumbnail_url
        })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Delete project
    if (route.startsWith('/admin/projects/') && method === 'DELETE') {
      const { authenticated } = await verifyAdmin(request)
      if (!authenticated) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const projectId = path[2]
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // Get all bookings (admin)
    if (route === '/admin/bookings' && method === 'GET') {
      const { authenticated } = await verifyAdmin(request)
      if (!authenticated) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Update booking status
    if (route.startsWith('/admin/bookings/') && method === 'PUT') {
      const { authenticated } = await verifyAdmin(request)
      if (!authenticated) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const bookingId = path[2]
      const body = await request.json()
      
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: body.status })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
