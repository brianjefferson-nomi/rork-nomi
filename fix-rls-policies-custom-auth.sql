-- Fix RLS Policies for Custom Authentication System
-- This removes all auth.uid() dependencies since the app uses custom auth with AsyncStorage
-- Run this in your Supabase SQL Editor

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;
DROP POLICY IF EXISTS "Collection members can view private collections" ON collections;
DROP POLICY IF EXISTS "Authenticated users can create collections" ON collections;
DROP POLICY IF EXISTS "Collection creators can update collections" ON collections;
DROP POLICY IF EXISTS "Collection members can view membership" ON collection_members;
DROP POLICY IF EXISTS "Collection creators can manage members" ON collection_members;
DROP POLICY IF EXISTS "Users can view votes in public collections" ON restaurant_votes;
DROP POLICY IF EXISTS "Collection members can view votes" ON restaurant_votes;
DROP POLICY IF EXISTS "Users can manage their own votes" ON restaurant_votes;
DROP POLICY IF EXISTS "Anyone can view reviews" ON user_reviews;
DROP POLICY IF EXISTS "Users can manage their own reviews" ON user_reviews;
DROP POLICY IF EXISTS "Users can view their own API calls" ON api_calls;
DROP POLICY IF EXISTS "System can insert API calls" ON api_calls;
DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
DROP POLICY IF EXISTS "Users can view activities in public collections" ON user_activities;
DROP POLICY IF EXISTS "System can insert activities" ON user_activities;
DROP POLICY IF EXISTS "Anyone can view discussions in public collections" ON restaurant_discussions;
DROP POLICY IF EXISTS "Collection members can view discussions" ON restaurant_discussions;
DROP POLICY IF EXISTS "Collection members can create discussions" ON restaurant_discussions;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can update restaurants" ON restaurants;

-- Create simplified policies that work with custom authentication
-- These policies allow all operations since authentication is handled at the application level

-- Collections policies (allow all operations)
CREATE POLICY "Allow all collections operations" ON collections FOR ALL USING (true);

-- Collection members policies (allow all operations)
CREATE POLICY "Allow all collection members operations" ON collection_members FOR ALL USING (true);

-- Collection restaurants policies (allow all operations) - THIS WAS MISSING!
CREATE POLICY "Allow all collection restaurants operations" ON collection_restaurants FOR ALL USING (true);

-- Restaurant votes policies (allow all operations)
CREATE POLICY "Allow all restaurant votes operations" ON restaurant_votes FOR ALL USING (true);

-- User reviews policies (allow all operations)
CREATE POLICY "Allow all user reviews operations" ON user_reviews FOR ALL USING (true);

-- API calls policies (allow all operations)
CREATE POLICY "Allow all API calls operations" ON api_calls FOR ALL USING (true);

-- User activities policies (allow all operations)
CREATE POLICY "Allow all user activities operations" ON user_activities FOR ALL USING (true);

-- Restaurant discussions policies (allow all operations)
CREATE POLICY "Allow all restaurant discussions operations" ON restaurant_discussions FOR ALL USING (true);

-- Users policies (allow all operations)
CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true);

-- Restaurants policies (allow all operations)
CREATE POLICY "Allow all restaurants operations" ON restaurants FOR ALL USING (true);

-- User relationships policies (allow all operations)
CREATE POLICY "Allow all user relationships operations" ON user_relationships FOR ALL USING (true);

-- Restaurant rankings policies (allow all operations)
CREATE POLICY "Allow all restaurant rankings operations" ON restaurant_rankings FOR ALL USING (true);

-- Plan invitations policies (allow all operations)
CREATE POLICY "Allow all plan invitations operations" ON plan_invitations FOR ALL USING (true);

-- Note: This approach removes RLS security since the app uses custom authentication.
-- Security should be implemented at the application level instead.
