# Supabase Storage Troubleshooting Guide

## Overview
This guide helps debug and resolve storage upload errors in the Supabase storage functionality for the kushie01 bucket.

## Common Issues and Solutions

### 1. Bucket Permissions (Most Common Issue)

**Problem**: Upload fails with permission denied errors.

**Solution**: Configure proper RLS (Row Level Security) policies in Supabase:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Storage** → **Buckets**
3. Click on the `kushie01` bucket
4. Go to **Policies** tab
5. Add these policies:

```sql
-- 1. Allow public to view all files
CREATE POLICY "Public can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'kushie01');

-- 2. Allow anyone to upload (for testing - restrict in production)
CREATE POLICY "Anyone can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'kushie01');

-- 3. Allow anyone to update (for testing - restrict in production)
CREATE POLICY "Anyone can update files" ON storage.objects
FOR UPDATE USING (bucket_id = 'kushie01');

-- 4. Allow anyone to delete (for testing - restrict in production)
CREATE POLICY "Anyone can delete files" ON storage.objects
FOR DELETE USING (bucket_id = 'kushie01');
```

**For Production** (more secure):
```sql
-- Only authenticated users can upload/update/delete
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kushie01');

CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'kushie01');

CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'kushie01');
```

### 2. CORS Configuration

**Problem**: Network errors or CORS policy blocking requests.

**Solution**:
1. Go to **Settings** → **API** in Supabase Dashboard
2. Add allowed origins:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (alternative dev port)
   - Your production domain (e.g., `https://yourdomain.com`)

### 3. Authentication Issues

**Problem**: Using anon key without proper permissions.

**Check**:
1. Verify your anon key in `.env`:
   ```
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. Ensure the key matches your Supabase project

### 4. File Size Limits

**Problem**: Files larger than allowed limit.

**Limits**:
- Free tier: 50MB per file
- Pro tier: 5GB per file

**Solution**: Check file size before upload (already implemented in code).

### 5. Network Issues

**Problem**: Slow or interrupted connections.

**Debug Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try uploading a file
4. Look for failed requests to `supabase.co`
5. Check response codes:
   - 401: Authentication issue
   - 403: Permission denied
   - 413: File too large
   - 500: Server error

## Quick Debugging Steps

1. **Use the Debug Component**:
   ```jsx
   import StorageManagementDebug from './StorageManagementDebug';
   // Use this instead of regular StorageManagement
   ```

2. **Check Browser Console**:
   - Press F12
   - Look for detailed error messages
   - Check for CORS errors

3. **Verify Bucket Exists**:
   ```javascript
   // In browser console
   const { data, error } = await supabase.storage.listBuckets()
   console.log('Buckets:', data)
   console.log('Error:', error)
   ```

4. **Test Direct Upload**:
   ```javascript
   // Test in browser console
   const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
   const { data, error } = await supabase.storage
     .from('kushie01')
     .upload('test.txt', testFile)
   console.log('Upload result:', { data, error })
   ```

## Environment Setup Checklist

- [ ] `.env` file exists with `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase URL is correct in `src/config/supabase.js`
- [ ] Bucket 'kushie01' exists in Supabase
- [ ] Bucket has proper RLS policies
- [ ] CORS is configured for your domain
- [ ] File size is under limit (50MB)

## Error Messages Guide

| Error Message | Likely Cause | Solution |
|--------------|--------------|----------|
| "new row violates row-level security policy" | Missing INSERT policy | Add INSERT policy to bucket |
| "bucket not found" | Wrong bucket name | Verify bucket name is 'kushie01' |
| "Invalid API key" | Wrong anon key | Check `.env` file |
| "CORS policy blocked" | CORS not configured | Add domain to Supabase CORS settings |
| "Payload too large" | File > 50MB | Reduce file size or upgrade plan |

## Contact Support

If issues persist:
1. Check [Supabase Status](https://status.supabase.com/)
2. Review [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
3. Contact Supabase support with:
   - Project URL
   - Error messages
   - Browser console logs
   - Network tab screenshots