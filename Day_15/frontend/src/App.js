import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import StudentManager from './components/StudentManager';
import 'antd/dist/reset.css';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StudentManager />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;