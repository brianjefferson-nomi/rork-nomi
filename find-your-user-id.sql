-- =====================================================
-- FIND YOUR USER ID
-- =====================================================

-- Step 1: Show all users (you can identify yourself by email)
SELECT 
  id,
  name,
  email,
  created_at
FROM users 
ORDER BY created_at DESC;

-- Step 2: If you know your email, use this to find your ID
-- Replace 'your.email@example.com' with your actual email
SELECT 
  id as your_user_id,
  name,
  email,
  created_at
FROM users 
WHERE email = 'your.email@example.com';  -- Replace with your email

-- Step 3: Copy your user ID from above and use it in the diagnostic script
SELECT 'Copy your user ID from above and replace YOUR_USER_ID_HERE in the diagnostic script' as instruction;
