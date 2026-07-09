import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (userId, { rejectWithValue }) => {
  try {
    const response = await API.get(`/tasks?userId=${userId}`);
    return response.data;
  } catch (error) { return rejectWithValue(error.message); }
});

export const addTask = createAsyncThunk('tasks/addTask', async (task, { rejectWithValue }) => {
  try {
    const response = await API.post('/tasks', task);
    return response.data;
  } catch (error) { return rejectWithValue(error.message); }
});

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await API.patch(`/tasks/${id}`, { status });
    return response.data;
  } catch (error) { return rejectWithValue(error.message); }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchTasks.rejected, (state, action) => { state.error = action.payload; state.loading = false; })
      
      .addCase(addTask.fulfilled, (state, action) => { state.items.push(action.payload); })
      
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export default taskSlice.reducer;