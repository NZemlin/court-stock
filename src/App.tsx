import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SampleLoader } from "@/components/SampleLoader";
import { Home } from "@/pages/index";
import { UploadPage } from "@/pages/upload";
import { ReorderPage } from "@/pages/reorder";
import { RecountPage } from "@/pages/recount";
import { StockPage } from "@/pages/stock";
import { ParsPage } from "@/pages/pars";

export function App() {
  return (
    <HashRouter>
      <SampleLoader />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reorder" element={<ReorderPage />} />
          <Route path="/recount" element={<RecountPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/pars" element={<ParsPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" toastOptions={{ className: "font-sans" }} />
    </HashRouter>
  );
}
