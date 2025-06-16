import Dashboard from '../assets/Dashboard.svg'
import Rate from '../assets/Rate.svg'
import Guest from '../assets/Guest.svg'
import Room from '../assets/Room.svg'
import Employee from '../assets/Deal.svg'
import { NavLink } from 'react-router-dom';

const NavItem = ({ icon, label, to }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-x-3 p-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer ${
          isActive ? 'text-blue-600 font-semibold' : ''
        }`
      }
      aria-label={`Navigate to ${label}`}
    >
      <img src={icon} alt={`${label} icon`} className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  </li>
);

function Sidebar() {
  const role = localStorage.getItem("role"); // 👈 Lấy role từ localStorage

  const navItems = [
    { icon: Dashboard, label: 'Dashboard', to: '/dashboard' },

    ...(role === "teacher"
      ? [
          { icon: Rate, label: 'Chủ nhiệm', to: '/dashboard?tab=homeroom' },
          { icon: Rate, label: 'Bộ môn', to: '/dashboard?tab=subject' },
        ]
      : []),

    ...(role === "admin"
      ? [
          { icon: Room, label: 'Quản lý lớp', to: '/admin/classes' },
          { icon: Employee, label: 'Quản lý tài khoản', to: '/admin/users' },
          { icon: Rate, label: 'Môn học', to: '/admin/subjects' },
        ]
      : [])
  ];

  return (
    <nav 
      className="fixed left-0 top-16 bottom-0 bg-white w-64 z-20 pt-4 shadow-md"
      aria-label="Main navigation"
    >
      <ul className="space-y-2 px-4">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            to={item.to}
          />
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
