import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuth from "./hooks/useAuth";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import ItemsList from "./pages/Items/ItemsList";
import CreateItem from "./pages/Items/CreateItem";
import EditItem from "./pages/Items/EditItem";
import ItemDetails from "./pages/Items/ItemDetails";
import CategoriesList from "./pages/Categories/CategoriesList";
import ItemTypesList from "./pages/ItemTypes/ItemTypesList";
import ManufacturersList from "./pages/Manufacturers/ManufacturersList";
import SuppliersList from "./pages/Suppliers/SuppliersList";
import UOMList from "./pages/UOM/UOMList";
import WarehousesList from "./pages/Warehouses/WarehousesList";
import WarehouseDetails from "./pages/Warehouses/WarehouseDetails";
import LocationsList from "./pages/Locations/LocationsList";

function LandingRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <ItemsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/new"
          element={
            <ProtectedRoute>
              <CreateItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id"
          element={
            <ProtectedRoute>
              <ItemDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items/:id/edit"
          element={
            <ProtectedRoute>
              <EditItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/item-types"
          element={
            <ProtectedRoute>
              <ItemTypesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manufacturers"
          element={
            <ProtectedRoute>
              <ManufacturersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <SuppliersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/uom"
          element={
            <ProtectedRoute>
              <UOMList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses"
          element={
            <ProtectedRoute>
              <WarehousesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouses/:id"
          element={
            <ProtectedRoute>
              <WarehouseDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <LocationsList />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LandingRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
