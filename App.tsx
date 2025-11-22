import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { SoundProvider } from './context/SoundContext';
import Layout from './components/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import AddEditTransactionPage from './pages/AddEditTransactionPage';
import SettingsPage from './pages/SettingsPage';
import BulkAddPage from './pages/BulkAddPage';
import SearchPage from './pages/SearchPage';
import ExportPage from './pages/ExportPage';

const App: React.FC = () => {
    return (
        <ToastProvider>
            <SoundProvider>
                <AppProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<DashboardPage />} />
                                <Route path="history" element={<TransactionHistoryPage />} />
                                <Route path="add" element={<AddEditTransactionPage />} />
                                <Route path="edit/:id" element={<AddEditTransactionPage />} />
                                <Route path="settings" element={<SettingsPage />} />
                                <Route path="bulk-add" element={<BulkAddPage />} />
                                <Route path="search" element={<SearchPage />} />
                                <Route path="export" element={<ExportPage />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </AppProvider>
            </SoundProvider>
        </ToastProvider>
    );
};

export default App;
