import { Route, Routes } from "react-router-dom"
import MainLayout from "./components/Layout"
import { User } from "./pages/User"
import AddUser from "./components/AddUser"
import { ScrappedData } from "./pages/ScrappedData"

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<User />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="web" element={<ScrappedData />} />
        </Route>
      </Routes>

    </>
  )
}

export default App
