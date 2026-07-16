// src/features/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/posts';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
});

export const createPost = createAsyncThunk('posts/createPost', async (newPost, { dispatch }) => {
  await axios.post(BASE_URL, newPost);   
  await dispatch(fetchPosts());
});

export const updatePost = createAsyncThunk('posts/updatePost', async ({ id, data }, { dispatch }) => {
  await axios.put(`${BASE_URL}/${id}`, data);
  await dispatch(fetchPosts());
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id, { dispatch }) => {
  await axios.delete(`${BASE_URL}/${id}`);
  await dispatch(fetchPosts());
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    isLoading: false,
    isMutating: false,
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
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // CREATE / UPDATE / DELETE share the same pending/fulfilled/rejected shape.
      // No manual state.posts patching needed — fetchPosts() already refreshed it.
      .addMatcher(
        (action) => [createPost.pending, updatePost.pending, deletePost.pending].some(t => t.type === action.type),
        (state) => { state.isMutating = true; state.error = null; }
      )
      .addMatcher(
        (action) => [createPost.fulfilled, updatePost.fulfilled, deletePost.fulfilled].some(t => t.type === action.type),
        (state) => { state.isMutating = false; }
      )
      .addMatcher(
        (action) => [createPost.rejected, updatePost.rejected, deletePost.rejected].some(t => t.type === action.type),
        (state, action) => { state.isMutating = false; state.error = action.error.message; }
      );
  }
});

export default postsSlice.reducer;