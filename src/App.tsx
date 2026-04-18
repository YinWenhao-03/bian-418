import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import BinancePlaza from "@/pages/BinancePlaza";
import Gainers from "@/pages/Gainers";
import RobotMonitor from "@/pages/RobotMonitor";
import TradeHistory from "@/pages/TradeHistory";
import SystemLogs from "@/pages/SystemLogs";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation */}
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-500">交易机器人</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/" className="hover:text-blue-400">首页</Link>
              <Link to="/dashboard" className="hover:text-blue-400">仪表盘</Link>
              <Link to="/monitor" className="hover:text-blue-400">监控</Link>
              <Link to="/trades" className="hover:text-blue-400">交易历史</Link>
              <Link to="/logs" className="hover:text-blue-400">日志</Link>
              <Link to="/settings" className="hover:text-blue-400">策略配置</Link>
              <Link to="/binance-plaza" className="hover:text-blue-400">币安广场</Link>
              <Link to="/gainers" className="hover:text-blue-400">涨幅榜</Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/monitor" element={<RobotMonitor />} />
            <Route path="/trades" element={<TradeHistory />} />
            <Route path="/logs" element={<SystemLogs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/binance-plaza" element={<BinancePlaza />} />
            <Route path="/gainers" element={<Gainers />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
