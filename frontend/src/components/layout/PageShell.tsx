import { Outlet } from 'react-router-dom'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'

export function PageShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Header />
      <main id="content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
