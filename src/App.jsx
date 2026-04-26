import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Home from './pages/Home';
import Universities from './pages/Universities';
import CollegeDetail from './pages/CollegeDetail';
import Favorites from './pages/Favorites';
// import Scholarships from './pages/Scholarships'; // temporarily hidden
import Resources from './pages/Resources';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import AdminImport from './pages/AdminImport';
import Compare from './pages/Compare';
import CollegeListBuilder from './pages/CollegeListBuilder';
import Rankings from './pages/Rankings';
import Export from './pages/Export';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/universities/:id" element={<CollegeDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            {/* <Route path="/scholarships" element={<Scholarships />} /> */}  {/* temporarily hidden */}
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/admin/import" element={<AdminImport />} />
            <Route path="/export" element={<Export />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/college-list-builder" element={<CollegeListBuilder />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App