import { Route, Routes } from "react-router-dom"
import MainLayout from "./components/Layout"
import { User } from "./pages/User"
import { ScrappedData } from "./pages/ScrappedData"
import { ToastProvider } from "./components/Toast"

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<User />} />
          <Route path="web" element={<ScrappedData />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

export default App
