import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/common/AppShell';
import { storage } from '../utils/storage';
import { Collections } from '../pages/Collections';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { MyRecipes } from '../pages/MyRecipes';
import { OperationLogs } from '../pages/OperationLogs';
import { RecipeCreate } from '../pages/RecipeCreate';
import { RecipeDetail } from '../pages/RecipeDetail';
import { RecipeEdit } from '../pages/RecipeEdit';
import { Register } from '../pages/Register';

interface PrivateRouteProps {
  children: JSX.Element;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  return storage.getToken() ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'recipe/:id', element: <RecipeDetail /> },
      {
        path: 'recipe/create',
        element: (
          <PrivateRoute>
            <RecipeCreate />
          </PrivateRoute>
        ),
      },
      {
        path: 'recipe/:id/edit',
        element: (
          <PrivateRoute>
            <RecipeEdit />
          </PrivateRoute>
        ),
      },
      {
        path: 'my/recipes',
        element: (
          <PrivateRoute>
            <MyRecipes />
          </PrivateRoute>
        ),
      },
      {
        path: 'collections',
        element: (
          <PrivateRoute>
            <Collections />
          </PrivateRoute>
        ),
      },
      {
        path: 'admin/logs',
        element: (
          <PrivateRoute>
            <OperationLogs />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
