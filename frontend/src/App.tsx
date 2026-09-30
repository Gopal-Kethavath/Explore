import { Route, Routes } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell.tsx'
import { AboutPage } from './pages/AboutPage.tsx'
import { ExplorePage } from './pages/ExplorePage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { PlaceDetailPage } from './pages/PlaceDetailPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="places/:slug" element={<PlaceDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
