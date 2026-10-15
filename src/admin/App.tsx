import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/admin/context/AuthContext';
import { AppRoutes } from '@/admin/routes';

export function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
