import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import StudyMaterialsPage from './components/StudyMaterialsPage';
import SchedulePage from './components/SchedulePage';
import ProfilePage from './components/ProfilePage';
import AttendancePage from './components/AttendancePage';
import FacialCheckinPage from './components/FacialCheckinPage';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import UpdatePasswordPage from './components/UpdatePasswordPage';
import { supabase } from './lib/supabaseClient';

type Page = 'home' | 'study_materials' | 'schedule' | 'profile' | 'attendance' | 'facial_checkin' | 'forgot_password' | 'update_password';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // App Navigation State
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    // 2. Listen for auth changes (Login, Logout, SignUp auto-login, Password Recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('update_password');
      } else if (event === 'SIGNED_IN') {
        // Se acabamos de logar e NÃO é uma recuperação de senha, vamos para a home.
        // O evento PASSWORD_RECOVERY é disparado antes de SIGNED_IN em alguns fluxos,
        // então precisamos ter cuidado para não sobrescrever a página de atualização.
        // Porém, normalmente em fluxos implícitos, o SIGNED_IN acontece. 
        // Vamos checar se já não estamos na pagina de update.
        setCurrentPage((prev) => prev === 'update_password' ? 'update_password' : 'home');
      } else if (event === 'SIGNED_OUT') {
        setCurrentPage('home'); // Reseta estado interno, mas a UI cairá no bloco !session
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSidebarOpen]);

  const handleNavigate = (page: Page) => {
    navigateTo(page);
    onClose();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    // onAuthStateChange will handle setting session to null
  };

  const onClose = () => {
    setIsSidebarOpen(false);
  }

  // Loading Screen
  if (isLoadingSession) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
             <div className="animate-spin h-10 w-10 border-4 border-brand-dark-blue border-t-transparent rounded-full"></div>
        </div>
    );
  }

  // Auth Logic for Pages that don't require session (Login, Forgot Password)
  if (!session) {
    if (currentPage === 'forgot_password') {
      return <ForgotPasswordPage onBackToLogin={() => setCurrentPage('home')} />;
    }
    // Default to Login Page if not logged in and not specifically on forgot password
    return <LoginPage onForgotPassword={() => setCurrentPage('forgot_password')} />;
  }

  // Special Case: Update Password (requires session usually, or is handled during recovery flow)
  if (currentPage === 'update_password') {
    return <UpdatePasswordPage onPasswordUpdated={() => navigateTo('home')} />;
  }

  // Main App Layout (Authenticated)
  return (
    <div className="font-display grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header onNavigateToHome={() => navigateTo('home')} onToggleSidebar={toggleSidebar} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={onClose} 
        onNavigate={(page) => handleNavigate(page)}
        onLogout={handleLogout}
      />
      <main>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-gray-200">
          {currentPage === 'home' && <HomePage onNavigateToStudyMaterials={() => navigateTo('study_materials')} />}
          {currentPage === 'study_materials' && <StudyMaterialsPage />}
          {currentPage === 'schedule' && <SchedulePage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'attendance' && <AttendancePage onNavigateToFacialCheckin={() => navigateTo('facial_checkin')} />}
          {currentPage === 'facial_checkin' && <FacialCheckinPage onBack={() => navigateTo('attendance')} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;