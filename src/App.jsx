
import React, { useState, useEffect, useRef } from 'react';

// --- Global Configuration & Sample Data ---

const ROLES = {
  ADMIN: 'Admin',
  PRODUCTION_MANAGER: 'Production Manager',
  SUPERVISOR: 'Supervisor',
  MACHINE_OPERATOR: 'Machine Operator',
  QUALITY_INSPECTOR: 'Quality Inspector',
};

const STATUS_MAP = {
  'Approved': 'badge-status-approved',
  'In Progress': 'badge-status-in-progress',
  'Pending Approval': 'badge-status-pending',
  'Rejected': 'badge-status-rejected',
  'On Hold': 'badge-status-exception',
  'Completed': 'badge-status-approved',
};

const PRODUCTION_ORDER_WORKFLOW = [
  { id: '1', name: 'Draft', description: 'Order created', role: ROLES.PRODUCTION_MANAGER, slaDays: 1 },
  { id: '2', name: 'Pending Approval', description: 'Awaiting manager approval', role: ROLES.PRODUCTION_MANAGER, slaDays: 2 },
  { id: '3', name: 'Scheduled', description: 'Resources allocated, schedule set', role: ROLES.SUPERVISOR, slaDays: 3 },
  { id: '4', name: 'In Production', description: 'Manufacturing started', role: ROLES.MACHINE_OPERATOR, slaDays: 5 },
  { id: '5', name: 'Quality Check', description: 'Inspection required', role: ROLES.QUALITY_INSPECTOR, slaDays: 1 },
  { id: '6', name: 'Completed', description: 'Production finished', role: null, slaDays: null },
];

const DASHBOARD_DATA = {
  totalOrders: 1520,
  inProgress: 450,
  completedLastMonth: 210,
  delayedOrders: 35,
  resourceUtilization: 85,
  onTrackPercentage: 75,
  avgCycleTime: '3.2 days',
  trends: {
    totalOrders: { value: '+5%', direction: 'up' },
    inProgress: { value: '+2%', direction: 'up' },
    delayedOrders: { value: '-10%', direction: 'down' },
  },
};

const PRODUCTION_ORDERS_DATA = [
  {
    id: 'PO-2023-001',
    product: 'Widget Xtreme',
    quantity: 1000,
    status: 'In Production',
    startDate: '2023-10-01',
    endDate: '2023-10-15',
    progress: 75,
    assignedTo: 'John Doe',
    priority: 'High',
    currentMilestone: 'In Production',
    lastUpdate: '2023-10-10T14:30:00Z',
    auditLog: [
      { id: '1', timestamp: '2023-10-01T08:00:00Z', user: 'Admin User', action: 'Production Order Created', details: 'PO-2023-001 for Widget Xtreme' },
      { id: '2', timestamp: '2023-10-02T09:15:00Z', user: 'Production Manager', action: 'Status Updated', details: 'From Draft to Pending Approval' },
      { id: '3', timestamp: '2023-10-03T10:00:00Z', user: 'Production Manager', action: 'Approved Order', details: 'Order approved and scheduled' },
      { id: '4', timestamp: '2023-10-05T11:00:00Z', user: 'Supervisor', action: 'Scheduled Production', details: 'Assigned to Machine Line 3' },
      { id: '5', timestamp: '2023-10-07T13:00:00Z', user: 'Machine Operator', action: 'Started Production', details: 'Began manufacturing Widget Xtreme' },
      { id: '6', timestamp: '2023-10-10T14:30:00Z', user: 'Machine Operator', action: 'Progress Update', details: '75% of items manufactured' },
    ],
    documents: [
      { id: 'doc1', name: 'Blueprint_WidgetX.pdf', type: 'PDF', uploadedBy: 'Admin', uploadedAt: '2023-09-28' },
      { id: 'doc2', name: 'MaterialList_PO001.xlsx', type: 'Excel', uploadedBy: 'Manager', uploadedAt: '2023-09-29' },
    ],
    relatedOrders: [
      { id: 'SO-2023-050', type: 'Sales Order', status: 'Fulfilled' },
      { id: 'MT-2023-005', type: 'Material Transfer', status: 'Completed' },
    ],
  },
  {
    id: 'PO-2023-002',
    product: 'Gear Cog V2',
    quantity: 500,
    status: 'Pending Approval',
    startDate: '2023-10-12',
    endDate: '2023-10-25',
    progress: 0,
    assignedTo: 'Jane Smith',
    priority: 'Medium',
    currentMilestone: 'Pending Approval',
    lastUpdate: '2023-10-11T10:00:00Z',
    auditLog: [
      { id: '1', timestamp: '2023-10-11T09:00:00Z', user: 'Production Manager', action: 'Production Order Created', details: 'PO-2023-002 for Gear Cog V2' },
      { id: '2', timestamp: '2023-10-11T10:00:00Z', user: 'Production Manager', action: 'Status Updated', details: 'From Draft to Pending Approval' },
    ],
    documents: [],
    relatedOrders: [],
  },
  {
    id: 'PO-2023-003',
    product: 'Shielding Plate',
    quantity: 200,
    status: 'Completed',
    startDate: '2023-09-10',
    endDate: '2023-09-20',
    progress: 100,
    assignedTo: 'Alice Green',
    priority: 'Low',
    currentMilestone: 'Completed',
    lastUpdate: '2023-09-20T16:00:00Z',
    auditLog: [
      { id: '1', timestamp: '2023-09-10T08:00:00Z', user: 'Admin User', action: 'Production Order Created', details: 'PO-2023-003 for Shielding Plate' },
      { id: '2', timestamp: '2023-09-20T16:00:00Z', user: 'Quality Inspector', action: 'Marked Completed', details: 'Final quality check passed' },
    ],
    documents: [],
    relatedOrders: [],
  },
  {
    id: 'PO-2023-004',
    product: 'Power Unit Z',
    quantity: 150,
    status: 'Rejected',
    startDate: '2023-10-01',
    endDate: null,
    progress: 0,
    assignedTo: 'Bob Johnson',
    priority: 'High',
    currentMilestone: 'Rejected',
    lastUpdate: '2023-10-05T11:00:00Z',
    auditLog: [
      { id: '1', timestamp: '2023-10-01T09:00:00Z', user: 'Production Manager', action: 'Production Order Created', details: 'PO-2023-004 for Power Unit Z' },
      { id: '2', timestamp: '2023-10-05T11:00:00Z', user: 'Production Manager', action: 'Order Rejected', details: 'Insufficient resources available' },
    ],
    documents: [],
    relatedOrders: [],
  },
  {
    id: 'PO-2023-005',
    product: 'Sensor Array Alpha',
    quantity: 250,
    status: 'On Hold',
    startDate: '2023-09-25',
    endDate: '2023-10-05',
    progress: 50,
    assignedTo: 'Alice Green',
    priority: 'Medium',
    currentMilestone: 'In Production',
    lastUpdate: '2023-10-01T10:00:00Z',
    auditLog: [
      { id: '1', timestamp: '2023-09-25T08:00:00Z', user: 'Admin User', action: 'Production Order Created', details: 'PO-2023-005 for Sensor Array Alpha' },
      { id: '2', timestamp: '2023-10-01T10:00:00Z', user: 'Supervisor', action: 'Order On Hold', details: 'Waiting for critical component' },
    ],
    documents: [],
    relatedOrders: [],
  },
];

const CHARTS_DATA = {
  productionVolume: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Units Produced',
        data: [1200, 1900, 3000, 2500, 2200, 3500],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
    type: 'Bar',
  },
  dailyOutput: {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Daily Output',
        data: [150, 180, 200, 160, 220, 210, 190],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
    type: 'Line',
  },
  statusDistribution: {
    labels: ['In Production', 'Pending Approval', 'Completed', 'Rejected', 'On Hold'],
    datasets: [
      {
        data: [450, 500, 200, 150, 220],
        backgroundColor: [
          'var(--status-in-progress-border)',
          'var(--status-pending-border)',
          'var(--status-approved-border)',
          'var(--status-rejected-border)',
          'var(--status-exception-border)',
        ],
        hoverOffset: 4,
      },
    ],
    type: 'Donut',
  },
  slaCompliance: {
    value: 85,
    max: 100,
    label: 'SLA Compliance (%)',
    type: 'Gauge',
  },
};

// --- Reusable Components ---

const Header = ({ title, onSearchToggle, currentUserRole, onGoHome }) => (
  <header className="header">
    <div className="flex items-center gap-md">
      <span className="logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>ProdTrack</span>
      <nav>
        <a href="#dashboard" className="nav-link" onClick={onGoHome}><span className="icon icon-dashboard"></span> Dashboard</a>
        {currentUserRole === ROLES.PRODUCTION_MANAGER && <a href="#orders" className="nav-link"><span className="icon icon-orders"></span> Orders</a>}
        {currentUserRole === ROLES.ADMIN && <a href="#settings" className="nav-link"><span className="icon icon-settings"></span> Admin</a>}
      </nav>
    </div>
    <div className="flex items-center gap-md">
      <Button icon={<span className="icon icon-search"></span>} onClick={onSearchToggle} className="button-icon" />
      <Button icon={<span className="icon icon-notifications"></span>} className="button-icon" />
      <Button icon={<span className="icon icon-user"></span>} text={currentUserRole} className="button-secondary" />
    </div>
  </header>
);

const Button = ({ onClick, text, icon, className = 'button-primary', type = 'button', disabled = false }) => (
  <button onClick={onClick} className={`button ${className}`} type={type} disabled={disabled}>
    {icon && <span style={{ marginRight: text ? 'var(--spacing-xs)' : '0' }}>{icon}</span>}
    {text}
  </button>
);

const Card = ({ children, onClick, className = '', style = {} }) => (
  <div
    className={`card ${className}`}
    onClick={onClick}
    style={style}
  >
    {children}
  </div>
);

const Badge = ({ status }) => {
  const statusClass = STATUS_MAP[status] || 'badge-status-exception';
  return <span className={`badge ${statusClass}`}>{status}</span>;
};

const TrendIndicator = ({ direction, value }) => {
  if (!direction || !value) return null;
  const trendClass = direction === 'up' ? 'trend-up' : 'trend-down';
  return <span className={`trend-indicator ${trendClass}`}>{value}</span>;
};

const Breadcrumbs = ({ paths, onNavigate }) => (
  <nav className="flex items-center text-sm text-secondary mb-lg">
    {paths?.map((path, index) => (
      <React.Fragment key={path?.id || index}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (path?.onClick) path.onClick();
          }}
          className="nav-link"
          style={index === paths.length - 1 ? { fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-main)' } : {}}
        >
          {path?.label}
        </a>
        {index < paths.length - 1 && <span style={{ margin: '0 var(--spacing-xxs)' }} className="icon icon-arrow-right"></span>}
      </React.Fragment>
    ))}
  </nav>
);

const GlobalSearch = ({ isActive, onClose }) => {
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target) && isActive) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActive, onClose]);

  useEffect(() => {
    if (isActive) {
      searchRef.current?.focus();
    }
  }, [isActive]);

  return (
    <div className={`global-search-container ${isActive ? 'active' : ''}`} ref={searchRef}>
      <input
        type="text"
        placeholder="Search orders, products, resources, tasks..."
        className="global-search-input"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      />
    </div>
  );
};

// Placeholder for Chart Components
const ChartComponent = ({ type, data, options, title }) => (
  <Card className="chart-card">
    <div style={{ textAlign: 'center' }}>
      <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{title} ({type})</h4>
      <p style={{ color: 'var(--text-secondary)' }}>
        {data?.labels ? `Data points: ${data.labels.length}` : 'No data to display.'}
        <br />
        <small>(Chart library integration needed)</small>
      </p>
    </div>
  </Card>
);

const EmptyState = ({ title, description, icon, ctaText, onCtaClick }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon || <span className="icon icon-info"></span>}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-description">{description}</p>
    {ctaText && onCtaClick && (
      <Button text={ctaText} onClick={onCtaClick} className="button-primary" />
    )}
  </div>
);

const MilestoneTracker = ({ workflow, currentMilestone }) => {
  const currentIndex = workflow.findIndex(step => step.name === currentMilestone);

  return (
    <div className="milestone-tracker">
      {workflow.map((step, index) => (
        <React.Fragment key={step?.id}>
          {index > 0 && (
            <div className={`milestone-connector ${index <= currentIndex ? 'completed' : ''}`} style={{ left: `${(index - 1) / (workflow.length - 1) * 100}%`, width: `${1 / (workflow.length - 1) * 100}%` }}></div>
          )}
          <div className="milestone-step">
            <div
              className={`milestone-circle ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''}`}
            >
              {index < currentIndex ? <span className="icon icon-check"></span> : (index + 1)}
            </div>
            <div className={`milestone-label ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''}`}>
              {step?.name}
              {step?.slaDays && index <= currentIndex && index < workflow.length -1 && (
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>SLA: {step.slaDays} days</div>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const AuditLogFeed = ({ logs, currentUserRole }) => {
  const filteredLogs = logs?.filter(log => {
    // Implement role-based visibility if needed for audit logs
    // For now, assuming all roles can see basic logs
    return true;
  });

  if (!filteredLogs || filteredLogs.length === 0) {
    return <EmptyState title="No Recent Activities" description="There are no audit logs for this record yet." icon={<span className="icon icon-audit"></span>} />;
  }

  return (
    <div className="flex-col gap-sm">
      {filteredLogs.map(log => (
        <div key={log?.id} className="news-feed-item">
          <div className="news-feed-icon">
            <span className="icon icon-audit"></span>
          </div>
          <div className="news-feed-content">
            <div className="title">{log?.action} by {log?.user}</div>
            <div className="meta">{log?.details}</div>
            <div className="meta">{new Date(log?.timestamp).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RelatedRecords = ({ records }) => {
  if (!records || records.length === 0) {
    return <EmptyState title="No Related Records" description="No related sales orders or material transfers found." icon={<span className="icon icon-related"></span>} />;
  }
  return (
    <div className="flex-col gap-sm">
      {records.map(record => (
        <Card key={record?.id} onClick={() => alert(`Navigating to ${record?.type} ${record?.id}`)} className="card-ghost" style={{ padding: 'var(--spacing-sm)' }}>
          <div className="flex justify-between items-center">
            <div className="font-semibold text-base">{record?.id}</div>
            <div className="text-sm text-secondary">{record?.type}</div>
            <Badge status={record?.status} />
          </div>
        </Card>
      ))}
    </div>
  );
};

const DocumentList = ({ documents, canUpload, onUploadClick }) => {
  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        title="No Documents"
        description="No documents are attached to this record."
        icon={<span className="icon icon-document"></span>}
        ctaText={canUpload ? "Upload Document" : null}
        onCtaClick={canUpload ? onUploadClick : null}
      />
    );
  }
  return (
    <div className="flex-col gap-sm">
      {documents.map(doc => (
        <Card key={doc?.id} onClick={() => alert(`Previewing ${doc?.name}`)} className="card-ghost" style={{ padding: 'var(--spacing-sm)' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-sm">
              <span className="icon icon-document" style={{ fontSize: 'var(--font-size-lg)' }}></span>
              <div className="font-semibold text-base">{doc?.name}</div>
            </div>
            <div className="text-sm text-secondary">{doc?.type}</div>
          </div>
        </Card>
      ))}
      {canUpload && (
        <Button text="Upload New Document" onClick={onUploadClick} icon={<span className="icon icon-upload"></span>} className="button-secondary" />
      )}
    </div>
  );
};

const TooltipContainer = ({ children, tooltipText }) => (
  <div className="tooltip-container">
    {children}
    <span className="tooltip-content">{tooltipText}</span>
  </div>
);

// --- Screen Components ---

const DashboardScreen = ({ onCardClick, onAddOrder, currentUserRole }) => {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [savedViews, setSavedViews] = useState([
    { id: 'all', name: 'All Orders', icon: '📦' },
    { id: 'in_progress', name: 'In Progress', icon: '🔵' },
    { id: 'my_tasks', name: 'My Tasks', icon: '👤', roles: [ROLES.PRODUCTION_MANAGER, ROLES.SUPERVISOR, ROLES.MACHINE_OPERATOR, ROLES.QUALITY_INSPECTOR] },
  ]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setFilterPanelOpen(false);
    console.log('Applied Filters:', filters);
  };

  const handleCreateOrderClick = () => {
    if (currentUserRole === ROLES.PRODUCTION_MANAGER) {
      onAddOrder();
    } else {
      alert('You do not have permission to create production orders.');
    }
  };

  // Simulate filtering based on activeFilters and searchTerm
  const filteredOrders = PRODUCTION_ORDERS_DATA
    .filter(order => {
      const matchesSearch = order?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order?.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order?.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilters = (!activeFilters?.status || order?.status === activeFilters.status) &&
                             (!activeFilters?.priority || order?.priority === activeFilters.priority);
      return matchesSearch && matchesFilters;
    })
    .filter(order => { // Saved view logic
      if (activeFilters.view === 'in_progress') return order.status === 'In Production';
      if (activeFilters.view === 'my_tasks') {
        // More complex logic would involve checking assignedTo vs current user
        return order.assignedTo === 'John Doe'; // Placeholder for demo
      }
      return true;
    });

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)' }}>
      <h1 style={{ fontSize: 'var(--font-size-h1)', marginBottom: 'var(--spacing-xl)' }}>Production Overview</h1>

      {/* KPI Overview */}
      <div className="flex flex-wrap gap-lg mb-xl">
        <Card onClick={() => console.log('KPI click: Total Orders')} style={{ flex: '1 1 200px', cursor: 'default' }}>
          <h3 className="text-xl text-secondary mb-xs">Total Orders</h3>
          <p className="text-xxl font-bold flex items-center">{DASHBOARD_DATA.totalOrders} <TrendIndicator {...DASHBOARD_DATA.trends.totalOrders} /></p>
          <small className="text-sm text-secondary">Across all stages</small>
        </Card>
        <Card onClick={() => console.log('KPI click: In Progress')} style={{ flex: '1 1 200px', border: '1px solid var(--status-in-progress-border)', animation: 'pulse 1.5s infinite', cursor: 'default' }}>
          <h3 className="text-xl text-secondary mb-xs">In Progress</h3>
          <p className="text-xxl font-bold flex items-center">{DASHBOARD_DATA.inProgress} <TrendIndicator {...DASHBOARD_DATA.trends.inProgress} /></p>
          <small className="text-sm text-secondary">Currently manufacturing</small>
        </Card>
        <Card onClick={() => console.log('KPI click: Completed')} style={{ flex: '1 1 200px', cursor: 'default' }}>
          <h3 className="text-xl text-secondary mb-xs">Completed (Last Month)</h3>
          <p className="text-xxl font-bold">{DASHBOARD_DATA.completedLastMonth}</p>
          <small className="text-sm text-secondary">Successfully finished</small>
        </Card>
        <Card onClick={() => console.log('KPI click: Delayed Orders')} style={{ flex: '1 1 200px', border: '1px solid var(--status-rejected-border)', cursor: 'default' }}>
          <h3 className="text-xl text-secondary mb-xs">Delayed Orders</h3>
          <p className="text-xxl font-bold flex items-center">{DASHBOARD_DATA.delayedOrders} <TrendIndicator {...DASHBOARD_DATA.trends.delayedOrders} /></p>
          <small className="text-sm text-secondary">Potential SLA breach</small>
        </Card>
      </div>

      {/* Charts Section */}
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)' }}>Production Metrics</h2>
      <div className="flex flex-wrap gap-lg mb-xl">
        <div style={{ flex: '1 1 45%' }}>
          <ChartComponent title="Production Volume (Monthly)" type="Bar" data={CHARTS_DATA.productionVolume} />
        </div>
        <div style={{ flex: '1 1 45%' }}>
          <ChartComponent title="Daily Output Trend" type="Line" data={CHARTS_DATA.dailyOutput} />
        </div>
        <div style={{ flex: '1 1 45%' }}>
          <ChartComponent title="Production Status Distribution" type="Donut" data={CHARTS_DATA.statusDistribution} />
        </div>
        <div style={{ flex: '1 1 45%' }}>
          <ChartComponent title="SLA Compliance" type="Gauge" data={CHARTS_DATA.slaCompliance} />
        </div>
      </div>

      {/* Production Orders Grid/Cards */}
      <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-lg)' }}>Production Orders</h2>
      <div className="grid-actions">
        <input
          type="text"
          placeholder="Search orders..."
          className="input-field"
          style={{ maxWidth: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button text="Filters" icon={<span className="icon icon-filter"></span>} className="button-secondary" onClick={() => setFilterPanelOpen(true)} />
        <Button text="Export" icon={<span className="icon icon-export"></span>} className="button-secondary" onClick={() => alert('Exporting data...')} />

        <div className="flex items-center gap-sm" style={{ marginLeft: 'auto' }}>
          {savedViews
            .filter(view => !view.roles || view.roles.includes(currentUserRole))
            .map(view => (
            <Button
              key={view.id}
              text={`${view.icon} ${view.name}`}
              className={activeFilters.view === view.id ? 'button-primary' : 'button-secondary'}
              onClick={() => setActiveFilters(prev => ({ ...prev, view: view.id }))}
            />
          ))}
        </div>

        {currentUserRole === ROLES.PRODUCTION_MANAGER && (
          <Button text="Create New Order" icon={<span className="icon icon-add"></span>} onClick={handleCreateOrderClick} />
        )}
      </div>

      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <Card key={order?.id} onClick={() => onCardClick(order?.id)}>
              <div className="flex justify-between items-center mb-md">
                <h3 className="text-lg font-semibold">{order?.id}</h3>
                <Badge status={order?.status} />
              </div>
              <p className="text-secondary mb-sm">Product: <span className="text-main font-medium">{order?.product}</span></p>
              <p className="text-secondary mb-sm">Quantity: <span className="text-main font-medium">{order?.quantity}</span></p>
              <p className="text-secondary mb-sm">Assigned To: <span className="text-main font-medium">{order?.assignedTo}</span></p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">Progress: {order?.progress}%</span>
                <div className="flex gap-sm">
                  <TooltipContainer tooltipText="View Details">
                    <Button icon={<span className="icon icon-view"></span>} className="button-icon" onClick={(e) => { e.stopPropagation(); onCardClick(order?.id); }} />
                  </TooltipContainer>
                  {(currentUserRole === ROLES.PRODUCTION_MANAGER || currentUserRole === ROLES.SUPERVISOR) && (
                    <TooltipContainer tooltipText="Edit Order">
                      <Button icon={<span className="icon icon-edit"></span>} className="button-icon" onClick={(e) => { e.stopPropagation(); alert(`Edit ${order?.id}`); }} />
                    </TooltipContainer>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              title="No Production Orders Found"
              description="Adjust your search or filters, or create a new order to get started."
              icon={<span className="icon icon-orders"></span>}
              ctaText={currentUserRole === ROLES.PRODUCTION_MANAGER ? "Create First Order" : null}
              onCtaClick={currentUserRole === ROLES.PRODUCTION_MANAGER ? handleCreateOrderClick : null}
            />
          </div>
        )}
      </div>

      {/* Filter Side Panel */}
      {filterPanelOpen && <div className="overlay-backdrop active" onClick={() => setFilterPanelOpen(false)}></div>}
      <div className={`side-panel ${filterPanelOpen ? 'active' : ''}`}>
        <div className="flex justify-between items-center mb-lg">
          <h3 className="font-semibold text-xl">Filters</h3>
          <Button icon={<span className="icon icon-close"></span>} className="button-icon" onClick={() => setFilterPanelOpen(false)} />
        </div>
        <div className="flex-col gap-md">
          <div className="form-group">
            <label>Status</label>
            <select
              className="input-field"
              value={activeFilters.status || ''}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value === '' ? undefined : e.target.value }))}
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_MAP).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              className="input-field"
              value={activeFilters.priority || ''}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, priority: e.target.value === '' ? undefined : e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          {/* More filters can be added here */}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--spacing-md)' }}>
          <Button text="Apply Filters" className="button-primary w-full" onClick={() => handleApplyFilters(activeFilters)} />
          <Button text="Clear" className="button-secondary w-full" onClick={() => setActiveFilters({})} />
        </div>
      </div>
    </div>
  );
};

const ProductionOrderDetailScreen = ({ orderId, onBack, currentUserRole, onEditOrder }) => {
  const order = PRODUCTION_ORDERS_DATA.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="container p-lg">
        <Breadcrumbs paths={[{ label: 'Dashboard', onClick: onBack }, { label: 'Order Not Found' }]} />
        <EmptyState
          title="Production Order Not Found"
          description={`The order with ID ${orderId} does not exist.`}
          icon={<span className="icon icon-info"></span>}
          ctaText="Back to Dashboard"
          onCtaClick={onBack}
        />
      </div>
    );
  }

  const canEdit = currentUserRole === ROLES.PRODUCTION_MANAGER || currentUserRole === ROLES.SUPERVISOR;
  const canUploadDocuments = currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.PRODUCTION_MANAGER;

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)' }}>
      <Breadcrumbs
        paths={[
          { label: 'Dashboard', onClick: onBack },
          { label: order?.id, id: order?.id }
        ]}
      />
      <div className="flex justify-between items-center mb-lg">
        <h1 style={{ fontSize: 'var(--font-size-h1)' }}>{order?.id}: {order?.product}</h1>
        <div className="flex gap-md">
          <Badge status={order?.status} />
          {canEdit && <Button text="Edit Order" icon={<span className="icon icon-edit"></span>} onClick={() => onEditOrder(order?.id)} />}
          {currentUserRole === ROLES.PRODUCTION_MANAGER && <Button text="Approve" icon={<span className="icon icon-check"></span>} className="button-primary" />}
        </div>
      </div>

      {/* Record Summary */}
      <div className="flex-col gap-lg mb-xl">
        <Card className="card-ghost">
          <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-md)' }}>Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md) var(--spacing-xl)' }}>
            <div>
              <p className="text-secondary mb-sm">Product Name:</p>
              <p className="text-main text-lg font-semibold">{order?.product}</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">Quantity:</p>
              <p className="text-main text-lg font-semibold">{order?.quantity}</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">Assigned To:</p>
              <p className="text-main text-lg font-semibold">{order?.assignedTo}</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">Priority:</p>
              <p className="text-main text-lg font-semibold">{order?.priority}</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">Start Date:</p>
              <p className="text-main text-lg font-semibold">{order?.startDate}</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">End Date:</p>
              <p className="text-main text-lg font-semibold">{order?.endDate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">Progress:</p>
              <p className="text-main text-lg font-semibold">{order?.progress}%</p>
            </div>
            <div>
              <p className="text-secondary mb-sm">Last Update:</p>
              <p className="text-main text-lg font-semibold">{new Date(order?.lastUpdate).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Milestone Tracker */}
        <Card className="card-ghost">
          <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-md)' }}>Workflow Progress</h2>
          <MilestoneTracker workflow={PRODUCTION_ORDER_WORKFLOW} currentMilestone={order?.currentMilestone} />
        </Card>

        {/* News/Audit Feed and Related Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
          <Card className="card-ghost">
            <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-md)' }}>Recent Activity & Audit Log</h2>
            <AuditLogFeed logs={order?.auditLog} currentUserRole={currentUserRole} />
          </Card>
          <div className="flex-col gap-lg">
            <Card className="card-ghost">
              <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-md)' }}>Documents</h2>
              <DocumentList
                documents={order?.documents}
                canUpload={canUploadDocuments}
                onUploadClick={() => alert(`Upload document for ${order?.id}`)}
              />
            </Card>
            <Card className="card-ghost">
              <h2 style={{ fontSize: 'var(--font-size-h2)', marginBottom: 'var(--spacing-md)' }}>Related Records</h2>
              <RelatedRecords records={order?.relatedOrders} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductionOrderFormScreen = ({ orderId, onSave, onCancel, currentUserRole }) => {
  const isEditing = !!orderId;
  const initialData = isEditing ? PRODUCTION_ORDERS_DATA.find(o => o.id === orderId) : {};

  const [formData, setFormData] = useState({
    product: initialData?.product || '',
    quantity: initialData?.quantity || '',
    priority: initialData?.priority || 'Medium',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    assignedTo: initialData?.assignedTo || '',
    status: initialData?.status || 'Draft',
    // ... other fields
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product) newErrors.product = 'Product name is mandatory.';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be a positive number.';
    if (!formData.startDate) newErrors.startDate = 'Start date is mandatory.';
    if (formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date cannot be before start date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please correct the form errors.');
      return;
    }
    console.log('Form Data Submitted:', formData);
    onSave(formData);
  };

  // Field-level security simulation
  const isFieldDisabled = (fieldName) => {
    if (currentUserRole === ROLES.MACHINE_OPERATOR && fieldName !== 'progress') return true; // Operator can only update progress
    if (currentUserRole === ROLES.QUALITY_INSPECTOR && !['status', 'qualityNotes'].includes(fieldName)) return true; // Inspector can only update status/notes
    return false; // Admins and Managers can edit most fields
  };

  // Mandatory field simulation (already in validateForm)
  // Auto-populated fields can be set in useEffect or initial useState
  useEffect(() => {
    if (!isEditing && !formData.assignedTo) {
      setFormData(prev => ({ ...prev, assignedTo: 'Unassigned' })); // Auto-populate
    }
  }, [isEditing, formData.assignedTo]);


  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-lg)' }}>
      <Breadcrumbs
        paths={[
          { label: 'Dashboard', onClick: onCancel },
          { label: isEditing ? orderId : 'New Order', id: orderId || 'new' }
        ]}
      />
      <h1 style={{ fontSize: 'var(--font-size-h1)', marginBottom: 'var(--spacing-xl)' }}>{isEditing ? `Edit Production Order: ${orderId}` : 'Create New Production Order'}</h1>
      <Card className="card-ghost" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="product">Product Name <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              id="product"
              name="product"
              className="input-field"
              value={formData?.product}
              onChange={handleChange}
              disabled={isFieldDisabled('product')}
            />
            {errors?.product && <p className="error-message">{errors.product}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity <span style={{color: 'red'}}>*</span></label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="input-field"
              value={formData?.quantity}
              onChange={handleChange}
              disabled={isFieldDisabled('quantity')}
            />
            {errors?.quantity && <p className="error-message">{errors.quantity}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              className="input-field"
              value={formData?.priority}
              onChange={handleChange}
              disabled={isFieldDisabled('priority')}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date <span style={{color: 'red'}}>*</span></label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="input-field"
              value={formData?.startDate}
              onChange={handleChange}
              disabled={isFieldDisabled('startDate')}
            />
            {errors?.startDate && <p className="error-message">{errors.startDate}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="input-field"
              value={formData?.endDate}
              onChange={handleChange}
              disabled={isFieldDisabled('endDate')}
            />
            {errors?.endDate && <p className="error-message">{errors.endDate}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <input
              type="text"
              id="assignedTo"
              name="assignedTo"
              className="input-field"
              value={formData?.assignedTo}
              onChange={handleChange}
              disabled={isFieldDisabled('assignedTo')}
            />
          </div>
          {/* File upload example */}
          <div className="form-group">
            <label htmlFor="documentUpload">Upload Document</label>
            <input
              type="file"
              id="documentUpload"
              name="documentUpload"
              className="input-field"
              style={{ padding: 'var(--spacing-xs)', border: 'none' }}
              disabled={isFieldDisabled('documentUpload')}
            />
          </div>

          <div className="flex gap-md justify-end mt-lg">
            <Button text="Cancel" onClick={onCancel} className="button-secondary" />
            <Button text={isEditing ? "Save Changes" : "Create Order"} type="submit" />
          </div>
        </form>
      </Card>
    </div>
  );
};


// --- Main Application Component ---

const App = () => {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.PRODUCTION_MANAGER); // Default role
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);

  // Handlers for navigation
  const navigateToDashboard = () => setView({ screen: 'DASHBOARD', params: {} });
  const navigateToOrderDetail = (orderId) => setView({ screen: 'ORDER_DETAIL', params: { orderId } });
  const navigateToOrderForm = (orderId = null) => setView({ screen: 'ORDER_FORM', params: { orderId } });

  const handleSaveOrder = (newOrderData) => {
    console.log('Saving order:', newOrderData);
    // In a real app, this would involve API calls and state updates
    navigateToDashboard(); // Go back to dashboard after save
  };

  const toggleGlobalSearch = () => {
    setIsGlobalSearchActive(prev => !prev);
  };

  const closeGlobalSearch = () => {
    setIsGlobalSearchActive(false);
  };


  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header
        title="ProdTrack"
        onSearchToggle={toggleGlobalSearch}
        currentUserRole={currentUserRole}
        onGoHome={navigateToDashboard}
      />
      <GlobalSearch isActive={isGlobalSearchActive} onClose={closeGlobalSearch} />

      {view.screen === 'DASHBOARD' && (
        <DashboardScreen
          onCardClick={navigateToOrderDetail}
          onAddOrder={() => navigateToOrderForm()}
          currentUserRole={currentUserRole}
        />
      )}
      {view.screen === 'ORDER_DETAIL' && (
        <ProductionOrderDetailScreen
          orderId={view.params?.orderId}
          onBack={navigateToDashboard}
          onEditOrder={navigateToOrderForm}
          currentUserRole={currentUserRole}
        />
      )}
      {view.screen === 'ORDER_FORM' && (
        <ProductionOrderFormScreen
          orderId={view.params?.orderId}
          onSave={handleSaveOrder}
          onCancel={navigateToDashboard}
          currentUserRole={currentUserRole}
        />
      )}
      {/* Role Switcher for Demo Purposes */}
      <div style={{ position: 'fixed', bottom: 'var(--spacing-md)', left: 'var(--spacing-md)', zIndex: 1000 }}>
        <Card className="card-ghost" style={{ padding: 'var(--spacing-sm)', cursor: 'default' }}>
          <label htmlFor="role-switcher" className="text-sm text-secondary">Current Role:</label>
          <select
            id="role-switcher"
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value)}
            className="input-field"
            style={{ width: 'auto', display: 'inline-block', marginLeft: 'var(--spacing-xs)' }}
          >
            {Object.values(ROLES).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </Card>
      </div>
    </div>
  );
};

export default App;