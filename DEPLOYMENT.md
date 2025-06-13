# Casino Game Deployment Guide

This guide explains how to deploy the casino game application to Netlify or Vercel.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account for database
- Netlify or Vercel account

## Project Structure

```
casino/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types and utilities
├── netlify.toml       # Netlify configuration
├── vercel.json        # Vercel configuration
└── DEPLOYMENT.md      # This file
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_SOCKET_URL=your_socket_server_url
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

## Netlify Deployment

### Option 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/out`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Option 2: Manual Deploy

1. Build the frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Deploy the `frontend/out` folder to Netlify

### Backend on Netlify

For the backend, you'll need to use Netlify Functions or deploy to a separate service like Railway, Render, or Heroku.

## Vercel Deployment

### Option 1: Git Integration (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your project to Vercel
3. Vercel will automatically detect Next.js and configure build settings
4. Add environment variables in Vercel dashboard
5. Deploy!

### Option 2: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## Database Setup (Supabase)

1. Create a new Supabase project
2. Run the SQL scripts in order:
   - `database_setup.sql`
   - `add_multiplier_column.sql`
   - `make_admin.sql` (optional, for admin users)

3. Enable Row Level Security (RLS) on your tables
4. Configure authentication providers if needed

## Build Commands

### Frontend
```bash
cd frontend
npm install
npm run build
```

### Backend
```bash
cd backend
npm install
npm run build
```

### Shared
```bash
cd shared
npm install
npm run build
```

## Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**
   - Ensure all dependencies are installed
   - Check that shared types are properly exported

2. **API calls fail in production**
   - Verify environment variables are set correctly
   - Check CORS settings in backend
   - Ensure API URLs use HTTPS in production

3. **Socket connections fail**
   - Verify socket server URL is correct
   - Check if WebSocket connections are allowed by hosting provider

4. **Database connection issues**
   - Verify Supabase credentials
   - Check if database is accessible from deployment environment

### Performance Optimization

1. **Frontend**
   - Images are set to `unoptimized: true` for static export
   - Consider using a CDN for static assets

2. **Backend**
   - Implement connection pooling for database
   - Add caching for frequently accessed data
   - Use compression middleware

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different keys for development and production

2. **API Security**
   - Implement rate limiting
   - Validate all user inputs
   - Use HTTPS in production

3. **Database Security**
   - Enable Row Level Security (RLS)
   - Use service role key only on backend
   - Regularly rotate API keys

## Monitoring and Logs

- Check deployment logs in Netlify/Vercel dashboard
- Monitor application performance
- Set up error tracking (e.g., Sentry)
- Monitor database usage in Supabase dashboard

## Support

If you encounter issues during deployment:
1. Check the build logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database is properly configured
4. Test the application locally before deploying