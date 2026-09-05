/* eslint-disable no-unused-vars */
 
 
import { useState } from 'react';
import { Download, CalendarClock, Settings, LayoutList, GripVertical } from 'lucide-react';
import { scheduleReport, exportMockData } from '../services/analyticsMockService.js';
import './ReportBuilder.css';

const AVAILABLE_FIELDS = [
  'Student Name', 'Email', 'Course Enrolled', 'Enrollment Date', 
  'Completion Date', 'Current Score (%)', 'Time Spent (Mins)', 'Last Login'
];

export default function ReportBuilder() {
  const [selectedFields, setSelectedFields] = useState(['Student Name', 'Course Enrolled', 'Current Score (%)']);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState('Weekly on Mondays');
  const [exporting, setExporting] = useState(false);

  // Drag state
  const [draggedField, setDraggedField] = useState(null);

  const handleDragStart = (e, field, source) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ field, source }));
    setDraggedField(field);
  };

  const handleDropToCanvas = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (data.source === 'available' && !selectedFields.includes(data.field)) {
      setSelectedFields([...selectedFields, data.field]);
    }
  };

  const handleDropToAvailable = (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (data.source === 'canvas') {
      setSelectedFields(selectedFields.filter(f => f !== data.field));
    }
  };

  const handleSchedule = async () => {
    setIsScheduling(true);
    await scheduleReport({ fields: selectedFields, freq: scheduleConfig });
    setIsScheduling(false);
    alert(`Report scheduled successfully: ${scheduleConfig}`);
  };

  const handleExport = async (type) => {
    setExporting(true);
    const result = await exportMockData(type);
    setExporting(false);
    alert(`Mock export ready: ${result.filename} generated from ${selectedFields.length} columns.`);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Custom Report Builder</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline btn-sm" onClick={() => handleExport('csv')} disabled={exporting}>
             <Download size={14} /> {exporting ? 'Generating...' : 'Export CSV'}
          </button>
          <button className="btn-primary" onClick={handleSchedule} disabled={isScheduling}>
            <CalendarClock size={16} /> {isScheduling ? 'Saving...' : 'Save & Schedule'}
          </button>
        </div>
      </div>

      <div className="report-builder-layout">
        
        {/* Left Panel: Available Fields */}
        <div 
          className="rb-sidepanel surface"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropToAvailable}
        >
          <h3 className="rb-panel-title"><LayoutList size={18} /> Available Data Fields</h3>
          <p className="rb-panel-desc">Drag fields onto the canvas to build your report columns. Drag them back to remove.</p>
          
          <div className="rb-fields-list">
            {AVAILABLE_FIELDS.filter(f => !selectedFields.includes(f)).map(field => (
              <div 
                key={field} 
                className="rb-field-pill available"
                draggable
                onDragStart={(e) => handleDragStart(e, field, 'available')}
              >
                <GripVertical size={14} className="drag-handle" /> {field}
              </div>
            ))}
            {AVAILABLE_FIELDS.filter(f => !selectedFields.includes(f)).length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: 32 }}>All fields added.</div>
            )}
          </div>
        </div>

        {/* Main Canvas: Report Preview */}
        <div 
          className="rb-main-canvas surface"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDropToCanvas}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 className="rb-panel-title" style={{ margin: 0 }}>Report Layout Preview</h3>
            <select value={scheduleConfig} onChange={e => setScheduleConfig(e.target.value)} className="date-picker-mock">
              <option>Daily at 8am</option>
              <option>Weekly on Mondays</option>
              <option>Monthly on the 1st</option>
              <option>Generate Once (Now)</option>
            </select>
          </div>

          <div className="rb-table-wrapper">
             {selectedFields.length === 0 ? (
               <div className="rb-empty-state">
                 <Settings size={48} />
                 <h4>No Columns Selected</h4>
                 <p>Drag data fields here to start building.</p>
               </div>
             ) : (
               <table className="rb-preview-table">
                 <thead>
                   <tr>
                     {selectedFields.map(field => (
                       <th key={field}>
                         <div 
                           className="rb-field-pill canvas"
                           draggable
                           onDragStart={(e) => handleDragStart(e, field, 'canvas')}
                         >
                           {field}
                         </div>
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {/* Mock rows reflecting the columns chosen */}
                   {[1, 2, 3].map(rowIdx => (
                     <tr key={rowIdx}>
                       {selectedFields.map(field => (
                         <td key={field}>
                           <div className="mock-data-line" />
                         </td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
