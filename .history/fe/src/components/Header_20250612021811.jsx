import Logo from '../assets/Logo.svg'
import Hlogo from '../assets/Hlogo.svg'
import Notification from '../assets/Vector.svg'
import Avatar from '../assets/Avatar.svg'
import Search from '../assets/Search.svg'
import { useState } from 'react'

function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  const handleNotificationClick = () => {
    // TODO: Implement notification functionality
    console.log('Notification clicked')
  }

  const handleProfileClick = () => {
    // TODO: Implement profile functionality
    console.log('Profile clicked')
  }

  return (
    <header className="fixed flex items-center justify-between h-16 px-8 bg-white top-0 left-0 right-0 z-50 shadow-md">
      {/* Left Section: Logo and Text */}
      <div className="flex items-center gap-x-2">
        <img className="h-8 cursor-pointer" src={Hlogo} alt="Logo" />
        <div className="text-[#cf0e23] font-bold text-lg ml-2 cursor-pointer">Hustendance</div>
      </div>


      {/* Right Section: Notification and Avatar */}
      <div className="flex items-center gap-x-4">
  <button 
    onClick={handleNotificationClick}
    className="h-6 w-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
    aria-label="View notifications"
  >
    <img src={Notification} alt="Notification icon" />
  </button>
  <button 
    onClick={handleProfileClick}
    className="h-8 w-8 rounded-full overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="View profile"
  >
    <img src={Avatar} alt="User avatar" />
  </button>

  {/* ✅ Nút đăng xuất */}
  <button
    onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }}
    className="px-4 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
  >
    Đăng xuất
  </button>
</div>
    </header>
  );
}

export default Header;