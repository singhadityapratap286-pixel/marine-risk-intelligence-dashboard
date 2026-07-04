function Navbar() {
  return (
    <nav className="bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-lg">
      <h2 className="text-2xl font-bold">
        🌊 Marine Intelligence
      </h2>

      <div className="flex gap-8">
        <a href="#">Dashboard</a>
        <a href="#">Map</a>
        <a href="#">Reports</a>
        <a href="#">Simulation</a>
      </div>
    </nav>
  );
}

export default Navbar;