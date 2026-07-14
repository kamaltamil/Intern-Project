// src/features/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/posts';

// --- ASYNC THUNKS (Calls to your Node.js Backend) ---

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get(BASE_URL);
  return response.data; // Backend sends combined array!
});

export const createPost = createAsyncThunk('posts/createPost', async (newPost) => {
  const response = await axios.post(BASE_URL, newPost);
  return response.data; 
});

export const updatePost = createAsyncThunk('posts/updatePost', async ({ id, data }) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data);
  return response.data;
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
  return id; // Return the ID so we can remove it from state
});

// --- SLICE ---
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [], // Single array for everything!
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(fetchPosts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload; 
      })
      // CREATE
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // Add new post to top
      })
      // UPDATE
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.posts[index] = action.payload;
      })
      // DELETE
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
      });
  }
});

export default postsSlice.reducer;