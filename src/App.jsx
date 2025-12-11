import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import "./App.css";
import { LoaderProvider } from "./Components/LoaderContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const IssueEditor = lazy(()=>import("./pages/IssueEditor"));
const ViewerPage =lazy(()=>import("./pages/Viewer.jsx"));
// const ThemeProvider = lazy(()=>import("./Components/ThemeContext"));
const LibraryPage = lazy (()=>import("./pages/LibraryPage.jsx"));
const Login = lazy (()=>import("./pages/Login"));
const Signup = lazy (()=>import ("./pages/Signup"));
const LandingPage = lazy(()=>import("./pages/LandingPage"));
const Layout = lazy (()=>import("./Components/Layout.jsx"));

// import Dashboard from "./pages/Dashboard";
// import IssueEditor from "./pages/IssueEditor";
// import ViewerPage from "./pages/Viewer.jsx";
import { ThemeProvider } from "./Components/ThemeContext";
// import LibraryPage from "./pages/LibraryPage.jsx";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import LandingPage from "./pages/LandingPage";
// import Layout from "./Components/Layout.jsx"; // Import the new Layout component


export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <ThemeProvider>
      <LoaderProvider>  
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor" element={<IssueEditor />} /> // for new issue
            <Route path="editor/:issueId" element={<IssueEditor />} />
            <Route path="/viewer/:issueId" element={<ViewerPage />} />
            <Route path="/LibraryPage" element={<LibraryPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<LandingPage />} />
          </Route>
        </Routes>
      </Router>
      </LoaderProvider>  
    </ThemeProvider>
    </Suspense>
  );
}
