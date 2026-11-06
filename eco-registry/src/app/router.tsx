import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../layout/AppLayout'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    hydrateFallbackElement: null,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('../pages/dashboard/DashboardPage')).DashboardPage }),
      },
      {
        path: 'citizens',
        lazy: async () => ({ Component: (await import('../pages/registry/RegistryPage')).RegistryPage }),
      },
      {
        path: 'citizens/new',
        lazy: async () => ({ Component: (await import('../pages/create/CreateCitizenPage')).CreateCitizenPage }),
      },
      {
        path: 'citizens/:id',
        lazy: async () => ({ Component: (await import('../pages/citizen/CitizenPage')).CitizenPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
