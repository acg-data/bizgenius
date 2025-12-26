import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Chip,
} from '@heroui/react';
import {
  HomeIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Ideas', href: '/ideas', icon: DocumentTextIcon },
  { name: 'Pricing', href: '/pricing', icon: SparklesIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        maxWidth="full"
        classNames={{
          base: 'bg-white border-b border-gray-200',
          wrapper: 'px-4 sm:px-6 lg:px-8',
        }}
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden"
          />
          <NavbarBrand>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">BizGenius</span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-1" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.name} isActive={isActive(item.href)}>
              <Link
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              isIconOnly
              variant="light"
              className="text-gray-500"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5" />
            </Button>
          </NavbarItem>
          
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user?.full_name || user?.email || 'User'}
                  size="sm"
                  src=""
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem key="dashboard" startContent={<HomeIcon className="w-4 h-4" />}>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownItem>
                <DropdownItem key="ideas" startContent={<DocumentTextIcon className="w-4 h-4" />}>
                  <Link to="/ideas">My Ideas</Link>
                </DropdownItem>
                <DropdownItem key="billing" startContent={<CreditCardIcon className="w-4 h-4" />}>
                  <Link to="/billing">Billing</Link>
                </DropdownItem>
                <DropdownItem key="settings" startContent={<Cog6ToothIcon className="w-4 h-4" />}>
                  <Link to="/settings">Settings</Link>
                </DropdownItem>
                <DropdownItem key="help" startContent={<QuestionMarkCircleIcon className="w-4 h-4" />}>
                  <Link to="/help">Help & Support</Link>
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                  onClick={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="bg-white pt-4">
          {navItems.map((item) => (
            <NavbarMenuItem key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 w-full py-3 px-4 rounded-lg text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>

      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-900">BizGenius</span>
              </div>
              <p className="text-sm text-gray-500">
                AI-powered business planning for entrepreneurs and startups.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/pricing" className="hover:text-primary-600">Pricing</Link></li>
                <li><Link to="/about" className="hover:text-primary-600">About</Link></li>
                <li><Link to="/contact" className="hover:text-primary-600">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/help" className="hover:text-primary-600">Help Center</Link></li>
                <li><Link to="/blog" className="hover:text-primary-600">Blog</Link></li>
                <li><Link to="/docs" className="hover:text-primary-600">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2024 BizGenius. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
