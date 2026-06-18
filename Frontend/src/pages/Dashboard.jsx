import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Wallet,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import StatCard from '../components/StatCard';
import './Dashboard.css';

const revenueData = [
  { name: 'Jan', orders: 89, earnings: 45, refunds: 10 },
  { name: 'Feb', orders: 98, earnings: 55, refunds: 15 },
  { name: 'Mar', orders: 68, earnings: 48, refunds: 8 },
  { name: 'Apr', orders: 108, earnings: 60, refunds: 12 },
  { name: 'May', orders: 78, earnings: 49, refunds: 9 },
  { name: 'Jun', orders: 84, earnings: 52, refunds: 11 },
  { name: 'Jul', orders: 51, earnings: 42, refunds: 5 },
  { name: 'Aug', orders: 28, earnings: 38, refunds: 7 },
  { name: 'Sep', orders: 92, earnings: 50, refunds: 8 },
  { name: 'Oct', orders: 42, earnings: 45, refunds: 25 },
  { name: 'Nov', orders: 88, earnings: 58, refunds: 15 },
  { name: 'Dec', orders: 36, earnings: 40, refunds: 32 },
];

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="page-title">Good Morning, Admin!</h4>
          <p className="text-muted mb-0">Here's what's happening with your store today.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light">01 Jan, 2026 to 31 Jan, 2026</button>
          <button className="btn btn-primary">+ Add Product</button>
        </div>
      </div>

      <div className="stats-grid mb-4">
        <StatCard 
          title="TOTAL EARNINGS" 
          value="559.25" 
          prefix="$"
          suffix="k"
          change="+16.24 %" 
          changeType="positive"
          linkText="View net earnings"
          icon={DollarSign}
          iconBgClass="bg-success-light"
        />
        <StatCard 
          title="ORDERS" 
          value="36,894" 
          change="-3.57 %" 
          changeType="negative"
          linkText="View all orders"
          icon={ShoppingBag}
          iconBgClass="bg-info-light"
        />
        <StatCard 
          title="CUSTOMERS" 
          value="183.35" 
          suffix="M"
          change="+29.08 %" 
          changeType="positive"
          linkText="See details"
          icon={Users}
          iconBgClass="bg-warning-light"
        />
        <StatCard 
          title="MY BALANCE" 
          value="165.89" 
          prefix="$"
          suffix="k"
          change="+0.00 %" 
          changeType="neutral"
          linkText="Withdraw money"
          icon={Wallet}
          iconBgClass="bg-primary-light"
        />
      </div>

      <div className="charts-grid">
        <div className="card revenue-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title m-0">Revenue</h5>
            <div className="chart-filters">
              <button className="filter-btn active">ALL</button>
              <button className="filter-btn">1M</button>
              <button className="filter-btn">6M</button>
              <button className="filter-btn">1Y</button>
            </div>
          </div>
          
          <div className="revenue-summary d-flex justify-content-center gap-4 mb-4">
            <div className="text-center">
              <h4 className="m-0">7,585</h4>
              <p className="text-muted m-0">Orders</p>
            </div>
            <div className="text-center">
              <h4 className="m-0">$22.89k</h4>
              <p className="text-muted m-0">Earnings</p>
            </div>
            <div className="text-center">
              <h4 className="m-0">367</h4>
              <p className="text-muted m-0">Refunds</p>
            </div>
            <div className="text-center">
              <h4 className="m-0 text-success">18.92%</h4>
              <p className="text-muted m-0">Conversation Ratio</p>
            </div>
          </div>

          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: 'none', boxShadow: 'var(--card-shadow)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="orders" stroke="var(--primary)" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} name="Orders" />
                <Line type="monotone" dataKey="earnings" stroke="var(--success)" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} name="Earnings" />
                <Line type="monotone" dataKey="refunds" stroke="var(--danger)" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Refunds" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card location-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title m-0">Sales by Locations</h5>
            <button className="btn btn-light btn-sm">Export Report</button>
          </div>
          
          <div className="map-placeholder">
            {/* Placeholder for map. In a real app, use react-simple-maps or similar */}
            <div className="map-image"></div>
          </div>
          
          <div className="location-stats mt-4">
            <div className="location-item mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="location-name">Canada</span>
                <span className="location-value">75%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: '75%', backgroundColor: 'var(--primary)'}}></div>
              </div>
            </div>
            <div className="location-item mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="location-name">Greenland</span>
                <span className="location-value">47%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: '47%', backgroundColor: 'var(--primary)'}}></div>
              </div>
            </div>
            <div className="location-item">
              <div className="d-flex justify-content-between mb-1">
                <span className="location-name">Russia</span>
                <span className="location-value">82%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width: '82%', backgroundColor: 'var(--primary)'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
