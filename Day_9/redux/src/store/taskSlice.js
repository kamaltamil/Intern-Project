import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/tasks');
    return response.data;
  } catch (error) { return rejectWithValue(error.message); }
});

export const addTask = createAsyncThunk('tasks/addTask', async (task, { rejectWithValue }) => {
  try {
    const response = await API.post('/tasks', task);
    return response.data; // json-server returns the saved object with its new ID
  } catch (error) { return rejectWithValue(error.message); }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.error = action.payload; state.loading = false; })
      
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  }
});

export default taskSlice.reducer;