import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { BuildingIcon, BusIcon, SearchIcon, PlusIcon } from '../common/Icons'

export const TransportHostelView: React.FC = () => {
  const { hostels, transportRoutes, activeSchool } = useSchoolErp()
  const [activeTab, setActiveTab] = useState<'hostels' | 'transport'>('hostels')
  const [searchTerm, setSearchTerm] = useState('')

  const totalDormCapacity = hostels.reduce((sum, h) => sum + h.capacity, 0)
  const totalDormOccupied = hostels.reduce((sum, h) => sum + h.occupied, 0)
  const dormOccupancyPct = Math.round((totalDormOccupied / (totalDormCapacity || 1)) * 100)
  const totalBusesStudents = transportRoutes.reduce((sum, r) => sum + r.enrolledStudentCount, 0)

  const filteredHostels = hostels.filter((h) =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.wardenName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRoutes = transportRoutes.filter((r) =>
    r.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Boarding Hostels & Transport Fleet
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Dormitory room & bed allocations, residential wardens, school bus routes, and stage pickup zones.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Boarding Dormitories</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{hostels.length} Halls</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            {totalDormCapacity} Total beds available
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Hostel Bed Occupancy</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>{dormOccupancyPct}%</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
            {totalDormOccupied} / {totalDormCapacity} Boarders residing
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>School Bus Fleet</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {transportRoutes.length} Active Routes
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Certified drivers & conductors</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Bus Ridership</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {totalBusesStudents} Pupils
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Enrolled in daily school commute</div>
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('hostels')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'hostels' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'hostels' ? '#ffffff' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BuildingIcon size={16} /> Boarding Hostels ({hostels.length})
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'transport' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'transport' ? '#ffffff' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BusIcon size={16} /> Transport Bus Routes ({transportRoutes.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 280px', maxWidth: '350px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            type="text"
            placeholder={activeTab === 'hostels' ? 'Search hostel hall or warden...' : 'Search route, bus plate or driver...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Hostels View */}
      {activeTab === 'hostels' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredHostels.map((dorm) => {
            const pct = Math.round((dorm.occupied / dorm.capacity) * 100)
            return (
              <div
                key={dorm.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{dorm.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{dorm.wing}</div>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: dorm.gender === 'Boys' ? '#dbeafe' : '#fce7f3',
                      color: dorm.gender === 'Boys' ? '#1e40af' : '#9d174d',
                    }}
                  >
                    {dorm.gender} Dorm
                  </span>
                </div>

                {/* Capacity Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748b' }}>Bed Occupancy</span>
                    <strong style={{ color: '#0f172a' }}>{dorm.occupied} / {dorm.capacity} Beds ({pct}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: pct >= 90 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#10b981',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>

                {/* Warden Info */}
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Resident Warden</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{dorm.wardenName}</div>
                  <div style={{ color: '#2563eb', marginTop: '2px' }}>{dorm.wardenPhone}</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Transport Routes View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredRoutes.map((rt) => (
            <div
              key={rt.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{rt.routeName}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                    {rt.vehicleReg}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Term Fare</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    {activeSchool.currency} {rt.feePerTerm.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Driver Card */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Driver & Helpline</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{rt.driverName}</div>
                <div style={{ color: '#2563eb', marginTop: '2px' }}>{rt.driverPhone}</div>
              </div>

              {/* Pickup Zones */}
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Pickup & Drop Stages ({rt.pickupZones.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {rt.pickupZones.map((zone, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Enrolled Students</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a' }}>
                  {rt.enrolledStudentCount} Commuters
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
