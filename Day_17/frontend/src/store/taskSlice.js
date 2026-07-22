import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  total: 0,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasksData: (state, action) => {
      state.tasks = action.payload.tasks;
      state.total = action.payload.total;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.total = 0;
    },
  },
});

export const { setTasksData, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
