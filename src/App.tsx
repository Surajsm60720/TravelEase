import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import DirectionsPage from "./components/directions";
import Navbar from "./components/navbar";
import { ThemeProvider } from "./components/theme-provider";
import routes from "tempo-routes";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="app-theme">
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/directions" element={<DirectionsPage />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
